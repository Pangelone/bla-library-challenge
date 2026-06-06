# frozen_string_literal: true

require "rails_helper"

RSpec.describe Book, type: :model do
  it "calculates available copies from active borrowings" do
    book = create(:book, total_copies: 2)
    create(:borrowing, book: book)
    expect(book.available_copies).to eq(1)
  end

  it "searches by title author or genre" do
    ruby_book = create(:book, title: "Practical Ruby", author: "Someone", genre: "Programming")
    create(:book, title: "Other", author: "Other", genre: "Fiction")

    expect(Book.search("ruby")).to contain_exactly(ruby_book)
  end
end
