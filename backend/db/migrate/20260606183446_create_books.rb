class CreateBooks < ActiveRecord::Migration[7.0]
  def change
    create_table :books do |t|
      t.string :title, null: false
      t.string :author, null: false
      t.string :genre, null: false
      t.string :isbn, null: false
      t.integer :total_copies, null: false, default: 1

      t.timestamps
    end

    add_index :books, :isbn, unique: true
    # Search fields - simple btree indexes help ILIKE prefix searches and sorting
    add_index :books, :title
    add_index :books, :author
    add_index :books, :genre
  end
end
