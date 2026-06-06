# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Dashboards API", type: :request do
  let(:librarian) { create(:user, :librarian) }
  let(:member) { create(:user) }

  it "returns librarian metrics" do
    create(:book)
    create(:borrowing)

    get "/api/v1/dashboard/librarian", headers: auth_headers(librarian)

    expect(response).to have_http_status(:ok)
    expect(json.keys).to include("total_books", "total_borrowed", "due_today", "overdue_members")
  end

  it "returns member loans" do
    create(:borrowing, user: member)

    get "/api/v1/dashboard/member", headers: auth_headers(member)

    expect(response).to have_http_status(:ok)
    expect(json["borrowed_books"].size).to eq(1)
  end
end
