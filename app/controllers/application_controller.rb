class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

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
