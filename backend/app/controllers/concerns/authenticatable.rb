# frozen_string_literal: true

# Pulls current user from Authorization header.
# I kept this as a concern so every API controller shares the same auth flow.
module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = bearer_token
    return render_unauthorized unless token

    payload = JsonWebToken.decode(token)
    return render_unauthorized unless payload

    @current_user = User.find_by(id: payload[:user_id])
    render_unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  def bearer_token
    header = request.headers["Authorization"].to_s
    return nil unless header.start_with?("Bearer ")

    header.split(" ").last
  end

  def render_unauthorized
    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
