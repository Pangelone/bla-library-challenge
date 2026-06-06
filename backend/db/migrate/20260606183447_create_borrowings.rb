class CreateBorrowings < ActiveRecord::Migration[7.0]
  def change
    create_table :borrowings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :book, null: false, foreign_key: true
      t.datetime :borrowed_at, null: false
      t.datetime :due_at, null: false
      t.datetime :returned_at

      t.timestamps
    end

    # Fast lookup for "active loan for user+book" (business rule: no duplicate borrows)
    add_index :borrowings, [:user_id, :book_id, :returned_at], name: "index_borrowings_on_user_book_active"
    add_index :borrowings, :due_at
    add_index :borrowings, :returned_at
  end
end
