# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Books API", type: :request do
  let(:librarian) { create(:user, :librarian) }
  let(:member) { create(:user) }

  describe "GET /api/v1/books" do
    it "lists books for authenticated users" do
      create(:book, title: "Clean Code")
      get "/api/v1/books", headers: auth_headers(member)

      expect(response).to have_http_status(:ok)
      expect(json.size).to eq(1)
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
