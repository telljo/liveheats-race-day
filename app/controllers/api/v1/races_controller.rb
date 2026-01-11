class Api::V1::RacesController < Api::V1::BaseController
  before_action :set_race, only: %i[show complete update]

  def index
    races = Race.all
    render json: races.as_json(include: [ :lane_assignments, :race_results ])
  end

  def show
    render json: @race.as_json(include: [ :lane_assignments, :race_results ])
  end

  def new; end

  def create
    @race = Race.new(race_params)
    @race.status ||= :draft

    if @race.save
      render json: @race.reload.as_json(include: [ :lane_assignments, :race_results ]), status: :created
    else
      render_error(messages: @race.errors.full_messages, status: :unprocessable_entity)
    end
  end

  def update
    if @race.update(race_params)
      render json: @race.reload.as_json(include: [ :lane_assignments, :race_results ]), status: :ok
    else
      render_error(messages: @race.errors.full_messages, status: :unprocessable_entity)
    end
  end

  def complete
    @race.assign_attributes(complete_race_params)

    begin
      @race.complete!
      render json: @race.as_json(include: [ :lane_assignments, :race_results ]), status: :ok
    rescue ActiveRecord::RecordInvalid
      render_error(messages: @race.errors.full_messages, status: :unprocessable_entity)
    end
  end

  private

  def set_race
    @race = Race.find(params.require(:id))
  end

  def race_params
    params.require(:race).permit(
      :name,
      lane_assignments_attributes: [
        :id,
        :student_id,
        :lane_number,
        :_destroy
      ]
    )
  end

  def complete_race_params
    params.require(:race).permit(
      :name,
      race_results_attributes: [
        :id,
        :student_id,
        :place
      ]
    )
  end
end
