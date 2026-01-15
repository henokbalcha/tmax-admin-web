
import { supabase } from './supabase';

export interface Product {
    id?: string;
    name: string;
    brand: string;
    price: number;
    original_price?: number;
    image_url: string;
    category: string;
    description: string;
    rating?: number;
    review_count?: number;
    stock?: number; // Admin only field
    sku?: string;   // Admin only field
    status?: string; // Admin only field
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address: string;
    payment_method: string;
    created_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    variant?: string;
    product?: Product;
}

export interface Banner {
    id?: string;
    title: string;
    subtitle: string;
    discount_text: string;
    image_url: string;
    active: boolean;
}

export const api = {
    products: {
        async list() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Product[];
        },

        async create(product: Omit<Product, 'id'>) {
            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Product;
        },

        async update(id: string, updates: Partial<Product>) {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async delete(id: string) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },

        async uploadImage(file: File) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        },

        async getStats() {
            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { count: lowStockCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .lt('stock', 10);

            const { data: products } = await supabase
                .from('products')
                .select('price, stock');

            const totalValue = products?.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0) || 0;
            const totalStock = products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;

            return {
                productCount: productCount || 0,
                lowStockCount: lowStockCount || 0,
                totalValue,
                totalStock
            };
        }
    },
    orders: {
        async list() {
            const { data, error } = await supabase
                .from('orders')
                .select('*, items:order_items(*, product:products(*))')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Order[];
        },
        async updateStatus(id: string, status: string) {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
    banners: {
        async list() {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('active', { ascending: false }); // Active first
            if (error) throw error;
            return data as Banner[];
        },
        async create(banner: Banner) {
            const { data, error } = await supabase
                .from('banners')
                .insert([banner])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id: string) {
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        async setActive(id: string) {
            // First set all to inactive (optional if logic allows multiple, but usually one banner)
            // For now, let's just update the target
            const { data, error } = await supabase
                .from('banners')
                .update({ active: true })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }
};
