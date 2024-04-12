"use client";
import { useEffect, useState } from "react";
import { sanitize } from "dompurify";


interface Review {
  id: number;
  text: string;
}

interface Product {
  id: number;
  image_url: string;
  title: string;
  description: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(
    JSON.parse(localStorage.getItem("cartItems") || "[]") || []
  );

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch("http://o-complex.com:1337/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(
        "http://o-complex.com:1337/products?page=1&page_size=20"
      );
      const data = await res.json();
      const productsData = data.products || [];
      setProducts(productsData);
    };
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    const itemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id
    );
    if (itemIndex !== -1) {
      const diffCartItems = [...cartItems];
      diffCartItems[itemIndex].quantity++;
      setCartItems(diffCartItems);
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    const itemIndex = cartItems.findIndex(
      (item) => item.product.id === productId
    );
    if (itemIndex !== -1) {
      const diffCartItems = [...cartItems];
      if (diffCartItems[itemIndex].quantity > 1) {
        diffCartItems[itemIndex].quantity--;
      } else {
        diffCartItems.splice(itemIndex, 1);
      }
      setCartItems(diffCartItems);
    }
  };

  return (
    <>
      <div className="header-container">
        <header className="header">
          <h2>тестовое задание</h2>
        </header>
      </div>
      <main className="main">
        <div className="main-container">
          <div className="main-content">
            <div className="main-reviews">
              {reviews.map((review, i) => (
                <div className="review-box" key={i}>
                  <h4>{sanitize(review.id.toString())}</h4>
                  <p>{sanitize(review.text)}</p>
                </div>
              ))}
            </div>
            <div className="center">
              <div className="adding-items">
                <h2>Добавленные товары</h2>
                {cartItems.map((item, index) => (
                  <div className="row" key={index}>
                    <h5>{sanitize(item.product.title)}</h5>
                    <span>x{item.quantity}</span>
                    <span>{item.product.price * item.quantity}₽</span>
                  </div>
                ))}
                <div className="main-order">
               
                  <input type="text" placeholder="Введите номер телефона"/>
                  <button>заказать</button>
                </div>
              </div>
            </div>
            <div className="main-items">
              <div className="container">
                <div className="items-content">
                  {products.map((product) => {
                    const cartItem = cartItems.find(
                      (item) => item.product.id === product.id
                    );
                    const quantityInCart = cartItem ? cartItem.quantity : 0;
                    return (
                      <div className="item-box" key={product.id}>
                        <div className="center">
                          <img src={product.image_url} alt="" />
                        </div>
                        <div className="des-n-title">
                          <h2>{sanitize(product.title)}</h2>
                          <p>{sanitize(product.description)}</p>
                        </div>
                        <div className="price">
                          <h4>цена: {product.price}₽</h4>
                        </div>
                        <div className="center">
                          {quantityInCart > 0 ? (
                            <div className="plus-input-minus">
                              <button
                                onClick={() => removeFromCart(product.id)}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={quantityInCart}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value >= 0) {
                                    const diffCartItems = [...cartItems];
                                    const itemIndex = diffCartItems.findIndex(
                                      (item) => item.product.id === product.id
                                    );
                                    if (itemIndex !== -1) {
                                      diffCartItems[itemIndex].quantity = value;
                                      setCartItems(diffCartItems);
                                    }
                                  }
                                }}
                              />

                              <button onClick={() => addToCart(product)}>
                                +
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(product)}>
                              купить
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
