import { supabase } from "@/integrations/supabase/client";

export interface PaymentRecord {
  amount: number;
  description: string;
  source_type: 'room_booking' | 'hall_booking' | 'pos_order' | 'supplier_payment' | 'gym_session' | 'game_session' | 'game_booking' | 'trainer_booking';
  source_id: string;
  reference_number: string;
  payment_method: string;
  guest_name?: string;
}

/**
 * Automatically creates an accounting entry when a payment is received
 * This integrates the payment system with the accounting module
 */
export const createAccountingEntryForPayment = async (payment: PaymentRecord) => {
  try {
    // Get the appropriate revenue category based on source type
    let categoryCode = 'REV-004'; // Default to "Other Revenue"
    
    switch (payment.source_type) {
      case 'room_booking':
        categoryCode = 'REV-001'; // Room Revenue
        break;
      case 'hall_booking':
        categoryCode = 'REV-003'; // Hall Rental Revenue
        break;
      case 'pos_order':
        categoryCode = 'REV-002'; // Food & Beverage Revenue
        break;
      case 'gym_session':
      case 'trainer_booking':
        categoryCode = 'REV-004'; // Other Revenue - Gym
        break;
      case 'game_session':
      case 'game_booking':
        categoryCode = 'REV-004'; // Other Revenue - Game Center
        break;
      case 'supplier_payment':
        categoryCode = 'EXP-003'; // Food & Beverage Costs (or other expense)
        break;
    }

    // Get the category ID from the account code
    const { data: category, error: categoryError } = await supabase
      .from('account_categories')
      .select('id, type')
      .eq('account_code', categoryCode)
      .single();

    if (categoryError || !category) {
      console.error('Failed to find accounting category:', categoryError);
      return null;
    }

    // Create the accounting entry
    const isExpense = payment.source_type === 'supplier_payment';
    const entryData = {
      entry_date: new Date().toISOString().split('T')[0],
      description: payment.description,
      reference_number: payment.reference_number,
      category_id: category.id,
      sub_category: payment.source_type.replace('_', ' '),
      amount: isExpense ? -Math.abs(payment.amount) : Math.abs(payment.amount),
      debit_amount: isExpense ? Math.abs(payment.amount) : 0,
      credit_amount: isExpense ? 0 : Math.abs(payment.amount),
      status: 'posted', // Automatically post payment entries
      source_type: payment.source_type,
      source_id: payment.source_id,
      notes: `Payment method: ${payment.payment_method}${payment.guest_name ? ` | Guest: ${payment.guest_name}` : ''}`,
    };

    const { data, error } = await supabase
      .from('account_entries')
      .insert([entryData])
      .select()
      .single();

    if (error) {
      console.error('Failed to create accounting entry:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createAccountingEntryForPayment:', error);
    return null;
  }
};

/**
 * Get all payments from various sources for the Payments Management page
 */
export const getAllPayments = async () => {
  try {
    const payments = [];

    // Get room booking payments
    const { data: roomBookings, error: roomError } = await supabase
      .from('room_bookings')
      .select(`
        id,
        guest_name,
        guest_phone,
        total_amount,
        payment_status,
        booking_status,
        check_in_date,
        created_at,
        rooms (room_number, room_type)
      `)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (!roomError && roomBookings) {
      roomBookings.forEach(booking => {
        payments.push({
          id: booking.id,
          transactionId: `RB-${booking.id.slice(0, 8)}`,
          guestName: booking.guest_name,
          amount: Number(booking.total_amount),
          method: 'card', // Default, could be enhanced
          type: 'booking',
          status: booking.booking_status === 'active' ? 'completed' : booking.booking_status,
          date: new Date(booking.created_at).toLocaleString(),
          description: `Room booking - ${booking.rooms?.[0]?.room_type || 'Room'}`,
          roomNumber: booking.rooms?.[0]?.room_number,
          reference: `REF_RB_${booking.id.slice(0, 6)}`,
        });
      });
    }

    // Get hall booking payments
    const { data: hallBookings, error: hallError } = await supabase
      .from('hall_bookings')
      .select(`
        id,
        organizer_name,
        event_name,
        total_amount,
        status,
        booking_date,
        created_at,
        halls (name)
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (!hallError && hallBookings) {
      hallBookings.forEach(booking => {
        payments.push({
          id: booking.id,
          transactionId: `HB-${booking.id.slice(0, 8)}`,
          guestName: booking.organizer_name,
          amount: Number(booking.total_amount),
          method: 'bank',
          type: 'booking',
          status: 'completed',
          date: new Date(booking.created_at).toLocaleString(),
          description: `Hall booking - ${booking.event_name}`,
          reference: `REF_HB_${booking.id.slice(0, 6)}`,
        });
      });
    }

    // Get POS order payments
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!orderError && orders) {
      orders.forEach(order => {
        payments.push({
          id: order.id,
          transactionId: `POS-${order.id.slice(0, 8)}`,
          guestName: order.guest_name,
          amount: Number(order.total_amount),
          method: order.payment_method || 'cash',
          type: 'pos',
          status: 'completed',
          date: new Date(order.created_at).toLocaleString(),
          description: `Restaurant/Bar order`,
          roomNumber: order.room_number,
          reference: `REF_POS_${order.id.slice(0, 6)}`,
        });
      });
    }

    // Get game sessions
    const { data: gameSessions, error: gameError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!gameError && gameSessions) {
      gameSessions.forEach(session => {
        payments.push({
          id: session.id,
          transactionId: `GAME-${session.id.slice(0, 8)}`,
          guestName: session.player_name,
          amount: Number(session.total_amount),
          method: session.payment_method || 'cash',
          type: 'game',
          status: 'completed',
          date: new Date(session.created_at).toLocaleString(),
          description: `Gaming session - ${session.duration_hours?.toFixed(1)}h`,
          reference: `REF_GAME_${session.id.slice(0, 6)}`,
        });
      });
    }

    // Get gym check-ins (paid sessions)
    const { data: gymCheckins, error: gymError } = await supabase
      .from('gym_member_checkins')
      .select(`
        *,
        gym_members (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!gymError && gymCheckins) {
      gymCheckins.forEach(checkin => {
        payments.push({
          id: checkin.id,
          transactionId: `GYM-${checkin.id.slice(0, 8)}`,
          guestName: checkin.gym_members?.name || 'Gym Member',
          amount: 0, // Check-ins are tracked, actual membership fees handled separately
          method: 'membership',
          type: 'gym',
          status: 'completed',
          date: new Date(checkin.check_in_time).toLocaleString(),
          description: `Gym check-in`,
          reference: `REF_GYM_${checkin.id.slice(0, 6)}`,
        });
      });
    }

    // Get trainer bookings
    const { data: trainerBookings, error: trainerError } = await supabase
      .from('gym_trainer_bookings')
      .select(`
        *,
        gym_trainers (name, hourly_rate)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!trainerError && trainerBookings) {
      trainerBookings.forEach(booking => {
        payments.push({
          id: booking.id,
          transactionId: `TRN-${booking.id.slice(0, 8)}`,
          guestName: 'Gym Member',
          amount: Number(booking.gym_trainers?.hourly_rate || 0),
          method: 'card',
          type: 'trainer',
          status: 'completed',
          date: new Date(booking.created_at).toLocaleString(),
          description: `Trainer session - ${booking.gym_trainers?.name}`,
          reference: `REF_TRN_${booking.id.slice(0, 6)}`,
        });
      });
    }

    // Get game bookings
    const { data: gameBookings, error: bookingError } = await supabase
      .from('game_bookings')
      .select('*')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!bookingError && gameBookings) {
      gameBookings.forEach(booking => {
        payments.push({
          id: booking.id,
          transactionId: `GB-${booking.id.slice(0, 8)}`,
          guestName: booking.player_name,
          amount: Number(booking.total_amount || 0),
          method: 'card',
          type: 'game_booking',
          status: booking.status === 'confirmed' ? 'completed' : booking.status,
          date: new Date(booking.created_at).toLocaleString(),
          description: `Game booking`,
          reference: `REF_GB_${booking.id.slice(0, 6)}`,
        });
      });
    }

    // Sort all payments by date (newest first)
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return payments;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    return [];
  }
};

/**
 * Get financial dashboard summary from all sources
 */
export const getFinancialDashboardSummary = async () => {
  try {
    // Get room booking revenue
    const { data: roomBookings } = await supabase
      .from('room_bookings')
      .select('total_amount, payment_status, created_at')
      .eq('payment_status', 'paid');

    const roomRevenue = roomBookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
    const todayRoomRevenue = roomBookings
      ?.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

    // Get hall booking revenue
    const { data: hallBookings } = await supabase
      .from('hall_bookings')
      .select('total_amount, status, created_at')
      .eq('status', 'confirmed');

    const hallRevenue = hallBookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
    const todayHallRevenue = hallBookings
      ?.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

    // Get POS revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status, created_at')
      .eq('status', 'paid');

    const posRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const todayPosRevenue = orders
      ?.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    // Get expense data from accounting
    const { data: expenses } = await supabase
      .from('account_entries')
      .select('amount, account_categories!inner(type)')
      .eq('status', 'posted')
      .eq('account_categories.type', 'expense');

    const totalExpenses = expenses?.reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0) || 0;

    return {
      totalRevenue: roomRevenue + hallRevenue + posRevenue,
      todayRevenue: todayRoomRevenue + todayHallRevenue + todayPosRevenue,
      roomRevenue,
      hallRevenue,
      posRevenue,
      totalExpenses,
      netIncome: (roomRevenue + hallRevenue + posRevenue) - totalExpenses,
    };
  } catch (error) {
    console.error('Error fetching financial dashboard summary:', error);
    return {
      totalRevenue: 0,
      todayRevenue: 0,
      roomRevenue: 0,
      hallRevenue: 0,
      posRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
    };
  }
};
