import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentPage {
  id: string;
  page_slug: string;
  page_title: string;
  content: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useContentPages = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('page_slug', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching content pages:', error);
      toast({
        title: "Error",
        description: "Failed to load content pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('page_slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching page:', error);
      return null;
    }
  };

  const updatePage = async (id: string, updates: Partial<ContentPage>) => {
    try {
      const { error } = await supabase
        .from('content_pages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchPages();
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createPage = async (page: Omit<ContentPage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('content_pages')
        .insert([page]);

      if (error) throw error;

      await fetchPages();
      toast({
        title: "Success",
        description: "Page created successfully",
      });
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPages();
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return {
    pages,
    loading,
    getPageBySlug,
    updatePage,
    createPage,
    deletePage,
    refetch: fetchPages
  };
};