class Api::V1::RacesController < ApplicationController
  before_action :set_race, only: %i[show]

  def index
    races = Race.all
    render json: races.as_json(include: [ :lane_assignments, :race_results ])
  end

  def show
    render json: @race.as_json(include: [ :lane_assignments, :race_results ])
  end

  def new; end

  def create
    @race = Race.new(request.params)

    if @race.save!
      render json: @race
    else
      render_error(messages: @race.errors.full_messages, status: :unprocessable_entity)
    end
  end

  private

  def set_race
    @race = Race.find(params.expect(:id))
  end

  # Only allow a list of trusted parameters through.
  def race_params
    params.require(:race).permit(
      :name, :status
    )
  end
end
