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
  end

  describe "POST /api/v1/auth/login" do
    it "returns a token for valid credentials" do
      user = create(:user, email: "login@library.test", password: "password123")

      post "/api/v1/auth/login", params: { email: user.email, password: "password123" }

      expect(response).to have_http_status(:ok)
      expect(json["token"]).to be_present
    end
  end
end
