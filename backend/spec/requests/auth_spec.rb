# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Authentication", type: :request do
  describe "POST /api/v1/auth/register" do
    it "creates a member and returns a token" do
      post "/api/v1/auth/register", params: {
        user: {
          name: "Ana Member",
          email: "ana@library.test",
          password: "password123",
          password_confirmation: "password123",
          role: "member"
        }
      }

      expect(response).to have_http_status(:created)
      expect(json["token"]).to be_present
      expect(json["user"]["role"]).to eq("member")
    end

    it "allows registering a librarian" do
      post "/api/v1/auth/register", params: {
        user: {
          name: "Leo Librarian",
          email: "leo@library.test",
          password: "password123",
          password_confirmation: "password123",
          role: "librarian"
        }
      }

      expect(response).to have_http_status(:created)
      expect(json["user"]["role"]).to eq("librarian")
    end
  end

  describe "POST /api/v1/auth/login" do
    it "returns a token for valid credentials" do
      user = create(:user, email: "login@library.test", password: "password123")

      post "/api/v1/auth/login", params: { email: user.email, password: "password123" }

      expect(response).to have_http_status(:ok)
      expect(json["token"]).to be_present
    end

    it "returns unauthorized for bad credentials" do
      post "/api/v1/auth/login", params: { email: "nope@test.com", password: "wrong" }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "returns ok" do
      delete "/api/v1/auth/logout"

      expect(response).to have_http_status(:ok)
      expect(json["message"]).to eq("Logged out")
    end
  end

  describe "GET /api/v1/auth/me" do
    it "returns 401 without a token" do
      get "/api/v1/auth/me"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
