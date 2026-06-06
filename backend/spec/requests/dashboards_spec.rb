# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Dashboards API", type: :request do
  let(:librarian) { create(:user, :librarian) }
  let(:member) { create(:user) }

  describe "GET /api/v1/dashboard/librarian" do
    it "returns librarian metrics" do
      create(:book)
      create(:borrowing)

      get "/api/v1/dashboard/librarian", headers: auth_headers(librarian)

      expect(response).to have_http_status(:ok)
      expect(json.keys).to include("total_books", "total_borrowed", "due_today", "overdue_members")
    end

    it "lists overdue members with counts" do
      overdue_book = create(:book)
      create(:borrowing, :overdue, user: member, book: overdue_book)

      get "/api/v1/dashboard/librarian", headers: auth_headers(librarian)

      expect(json["overdue_members"].size).to eq(1)
      expect(json["overdue_members"].first["user"]["id"]).to eq(member.id)
      expect(json["overdue_members"].first["overdue_count"]).to eq(1)
    end

    it "forbids members" do
      get "/api/v1/dashboard/librarian", headers: auth_headers(member)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /api/v1/dashboard/member" do
    it "returns member loans" do
      create(:borrowing, user: member)

      get "/api/v1/dashboard/member", headers: auth_headers(member)

      expect(response).to have_http_status(:ok)
      expect(json["borrowed_books"].size).to eq(1)
    end

    it "separates overdue books" do
      overdue_book = create(:book)
      create(:borrowing, :overdue, user: member, book: overdue_book)

      get "/api/v1/dashboard/member", headers: auth_headers(member)

      expect(json["overdue_books"].size).to eq(1)
      expect(json["overdue_books"].first["overdue"]).to be(true)
    end
  end
end
