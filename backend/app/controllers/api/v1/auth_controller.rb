# frozen_string_literal: true

module Api
  module V1
    # Public auth endpoints - no Authenticatable concern on the whole controller
    class AuthController < ApplicationController
      def register
        user = User.new(register_params)

        if user.save
          token = JsonWebToken.encode(user.id)
          render json: { user: user.as_json, token: token }, status: :created
        else
          render_errors(user)
        end
      end

      def login
        user = User.find_by(email: params[:email].to_s.strip.downcase)

        if user&.authenticate(params[:password])
          token = JsonWebToken.encode(user.id)
          render json: { user: user.as_json, token: token }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def me
        authenticate_user_inline
        return if performed?

        render json: { user: @current_user.as_json }, status: :ok
      end

      def logout
        # Stateless JWT: client drops the token. Endpoint exists so the API contract feels complete.
        render json: { message: "Logged out" }, status: :ok
      end

      private

      def register_params
        params.require(:user).permit(:email, :password, :password_confirmation, :name, :role)
      end

      def authenticate_user_inline
        token = request.headers["Authorization"].to_s.split(" ").last
        payload = JsonWebToken.decode(token)
        @current_user = User.find_by(id: payload[:user_id]) if payload
        render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
      end
    end
  end
end
