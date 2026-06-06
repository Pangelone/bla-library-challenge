# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Books API", type: :request do
  let(:librarian) { create(:user, :librarian) }
  let(:member) { create(:user) }
  let!(:book) { create(:book, title: "Clean Code") }

  describe "GET /api/v1/books" do
    it "lists books for authenticated users" do
      get "/api/v1/books", headers: auth_headers(member)

      expect(response).to have_http_status(:ok)
      expect(json.size).to eq(1)
    end

    it "flags books the member already borrowed" do
      loaned = create(:book, title: "Loaned Book", isbn: "LOAN123")
      create(:borrowing, user: member, book: loaned)

      get "/api/v1/books", headers: auth_headers(member)

      entry = json.find { |book| book["id"] == loaned.id }
      expect(entry["user_has_active_loan"]).to be(true)
    end

    it "returns 401 without auth" do
      get "/api/v1/books"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/books/:id" do
    it "shows a single book" do
      get "/api/v1/books/#{book.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:ok)
      expect(json["title"]).to eq("Clean Code")
    end
  end

  describe "POST /api/v1/books" do
    it "allows librarians to create books" do
      post "/api/v1/books",
           params: { book: { title: "DDD", author: "Evans", genre: "Software", isbn: "ISBN999", total_copies: 2 } },
           headers: auth_headers(librarian)

      expect(response).to have_http_status(:created)
    end

    it "forbids members from creating books" do
      post "/api/v1/books",
           params: { book: { title: "X", author: "Y", genre: "Z", isbn: "ISBN888", total_copies: 1 } },
           headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/books/:id" do
    it "allows librarians to update books" do
      patch "/api/v1/books/#{book.id}",
            params: { book: { title: "Clean Code 2nd ed" } },
            headers: auth_headers(librarian)

      expect(response).to have_http_status(:ok)
      expect(json["title"]).to eq("Clean Code 2nd ed")
    end

    it "forbids members from updating books" do
      patch "/api/v1/books/#{book.id}",
            params: { book: { title: "Hack attempt" } },
            headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/books/:id" do
    it "allows librarians to delete books" do
      doomed = create(:book, isbn: "DELETE123")

      delete "/api/v1/books/#{doomed.id}", headers: auth_headers(librarian)

      expect(response).to have_http_status(:no_content)
      expect(Book.find_by(id: doomed.id)).to be_nil
    end

    it "forbids members from deleting books" do
      delete "/api/v1/books/#{book.id}", headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/v1/books with search" do
    it "filters by query param q" do
      create(:book, title: "Ruby Pickaxe")
      create(:book, title: "Something else")

      get "/api/v1/books", params: { q: "pickaxe" }, headers: auth_headers(member)

      expect(json.size).to eq(1)
      expect(json.first["title"]).to eq("Ruby Pickaxe")
    end
  end
end
