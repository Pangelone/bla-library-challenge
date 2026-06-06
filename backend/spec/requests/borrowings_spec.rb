# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Borrowings API", type: :request do
  let(:member) { create(:user) }
  let(:librarian) { create(:user, :librarian) }
  let(:book) { create(:book, total_copies: 1) }

  describe "POST /api/v1/borrowings" do
    it "lets a member borrow an available book" do
      post "/api/v1/borrowings", params: { book_id: book.id }, headers: auth_headers(member)

      expect(response).to have_http_status(:created)
      expect(json["book"]["id"]).to eq(book.id)
    end

    it "blocks duplicate active loans for the same book" do
      book = create(:book, total_copies: 2)
      create(:borrowing, user: member, book: book)

      post "/api/v1/borrowings", params: { book_id: book.id }, headers: auth_headers(member)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("You already have an active loan for this book")
    end
  end

  describe "PATCH /api/v1/borrowings/:id/return" do
    it "lets a librarian mark a book as returned" do
      borrowing = create(:borrowing, user: member, book: book)

      patch "/api/v1/borrowings/#{borrowing.id}/return", headers: auth_headers(librarian)

      expect(response).to have_http_status(:ok)
      expect(borrowing.reload.returned_at).to be_present
    end
  end
end
