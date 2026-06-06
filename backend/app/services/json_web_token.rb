# frozen_string_literal: true

# Small wrapper around JWT - keeps auth logic out of controllers.
# Explicit sign/verify here instead of pulling in a larger auth gem for this scope.
module JsonWebToken
  module_function

  def encode(user_id)
    payload = { user_id: user_id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, secret_key)
  end

  def decode(token)
    body = JWT.decode(token, secret_key)[0]
    HashWithIndifferentAccess.new(body)
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end

  def secret_key
    Rails.application.credentials.secret_key_base
  end
end
