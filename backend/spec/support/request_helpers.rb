# frozen_string_literal: true

module RequestHelpers
  def json
    JSON.parse(response.body)
  end

  def auth_headers(user)
    token = JsonWebToken.encode(user.id)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.include RequestHelpers, type: :request
end
