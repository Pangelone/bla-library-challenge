class ApplicationController < ActionController::API
  include Pundit::Authorization

  # Central place for API error shape - keeps controllers from repeating render logic
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def render_forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end

  def render_not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def render_errors(record, status: :unprocessable_entity)
    render json: { errors: record.errors.full_messages }, status: status
  end
end
