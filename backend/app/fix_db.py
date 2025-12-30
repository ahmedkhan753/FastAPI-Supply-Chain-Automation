if __name__ == "__main__":
    from app.database import engine
    from sqlalchemy import text

    def migrate():
        with engine.connect() as conn:
            columns = [
                ("quantity", "INT NOT NULL DEFAULT 1"),
                ("total_amount", "FLOAT NOT NULL DEFAULT 0.0"),
                ("advance_payment", "FLOAT DEFAULT 0.0"),
                ("remaining_payment", "FLOAT NOT NULL DEFAULT 0.0"),
                ("status", "ENUM('placed', 'confirmed', 'dispatched', 'delivered', 'stock_requested') NOT NULL DEFAULT 'placed'")
                # product_name added previously
            ]
            
            for col_name, col_def in columns:
                try:
                    conn.execute(text(f"SELECT {col_name} FROM orders LIMIT 1"))
                    print(f"Column '{col_name}' already exists.")
                except Exception:
                    print(f"Column '{col_name}' missing. Adding it...")
                    try:
                        conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_def}"))
                        conn.commit()
                        print(f"Successfully added '{col_name}' column.")
                    except Exception as e:
                        print(f"Failed to add column {col_name}: {e}")

    migrate()
