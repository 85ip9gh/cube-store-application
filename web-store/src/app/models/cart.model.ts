// Interface for the cart space: holds cart items
export interface Cart {
    items: Array<CartItem>;
}


// defining the cart item
export interface CartItem {
    product: string;
    name: string;
    price: number;
    quantity: number;
    id: number;
}