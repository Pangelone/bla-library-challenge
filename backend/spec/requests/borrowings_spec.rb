# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Borrowings API", type: :request do
  let(:member) { create(:user) }
  let(:librarian) { create(:user, :librarian) }
  let(:book) { create(:book, total_copies: 1) }

  describe "GET /api/v1/borrowings" do
    it "lists member loans only for members" do
      mine = create(:borrowing, user: member)
      create(:borrowing)

      get "/api/v1/borrowings", headers: auth_headers(member)

      expect(json.size).to eq(1)
      expect(json.first["id"]).to eq(mine.id)
    end

    it "lists all loans for librarians" do
      create(:borrowing, user: member)
      create(:borrowing)

      get "/api/v1/borrowings", headers: auth_headers(librarian)

      expect(json.size).to eq(2)
    end
  end

  describe "GET /api/v1/borrowings/:id" do
    it "lets a member view their own loan" do
      loan = create(:borrowing, user: member)

      get "/api/v1/borrowings/#{loan.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(loan.id)
    end

    it "forbids a member from viewing someone else loan" do
      other_loan = create(:borrowing)

      get "/api/v1/borrowings/#{other_loan.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/borrowings" do
    it "lets a member borrow an available book" do
      post "/api/v1/borrowings", params: { book_id: book.id }, headers: auth_headers(member)

      expect(response).to have_http_status(:created)
      expect(json["book"]["id"]).to eq(book.id)
    end

    it "blocks borrowing when no copies are left" do
      create(:borrowing, book: book)

      post "/api/v1/borrowings", params: { book_id: book.id }, headers: auth_headers(member)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("Book is not available")
    end

    it "blocks duplicate active loans for the same book" do
      available_book = create(:book, total_copies: 2)
      create(:borrowing, user: member, book: available_book)

      post "/api/v1/borrowings", params: { book_id: available_book.id }, headers: auth_headers(member)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]).to include("You already have an active loan for this book")
    end

    it "forbids librarians from borrowing" do
      post "/api/v1/borrowings", params: { book_id: book.id }, headers: auth_headers(librarian)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/borrowings/:id" do
    it "lets a librarian update due date" do
      loan = create(:borrowing, user: member, book: book)
      new_due = 3.weeks.from_now.iso8601

      patch "/api/v1/borrowings/#{loan.id}",
            params: { borrowing: { due_at: new_due } },
            headers: auth_headers(librarian)

      expect(response).to have_http_status(:ok)
      expect(Time.zone.parse(json["due_at"]).to_i).to eq(Time.zone.parse(new_due).to_i)
    end

    it "forbids members from updating loans" do
      loan = create(:borrowing, user: member, book: book)

      patch "/api/v1/borrowings/#{loan.id}",
            params: { borrowing: { due_at: 1.week.from_now } },
            headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/borrowings/:id" do
    it "lets a librarian delete a loan record" do
      loan = create(:borrowing, user: member, book: book)

      delete "/api/v1/borrowings/#{loan.id}", headers: auth_headers(librarian)

      expect(response).to have_http_status(:no_content)
      expect(Borrowing.find_by(id: loan.id)).to be_nil
    end

    it "forbids members from deleting loans" do
      loan = create(:borrowing, user: member, book: book)

      delete "/api/v1/borrowings/#{loan.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/borrowings/:id/return" do
    it "lets a librarian mark a book as returned" do
      borrowing = create(:borrowing, user: member, book: book)

      patch "/api/v1/borrowings/#{borrowing.id}/return", headers: auth_headers(librarian)

      expect(response).to have_http_status(:ok)
      expect(borrowing.reload.returned_at).to be_present
    end

    it "forbids members from returning books" do
      borrowing = create(:borrowing, user: member, book: book)

      patch "/api/v1/borrowings/#{borrowing.id}/return", headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end
end
