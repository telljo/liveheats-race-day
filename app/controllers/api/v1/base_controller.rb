class Api::V1::BaseController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound do |e|
    render_error(messages: [ "Not found" ], status: :not_found)
  end

  rescue_from ActionController::ParameterMissing do |e|
    render_error(messages: [ e.message ], status: :bad_request)
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render_error(messages: e.record.errors.full_messages, status: :unprocessable_entity)
  end

  rescue_from StandardError do |e|
    Rails.logger.error(e.class.name)
    Rails.logger.error(e.message)
    Rails.logger.error(e.backtrace.join("\n")) if e.backtrace

    render_error(messages: [ "Server error" ], status: :internal_server_error)
  end

  private

  def render_error(messages:, status:)
    render json: {
      success: false,
      error: {
        message: messages,
        status: Rack::Utils::SYMBOL_TO_STATUS_CODE[status]
      }
    }, status: status
  end
end
