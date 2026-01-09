class RacesController < ApplicationController
  def index
  end

  def show
    @race_id = params[:id]
  end

  def new
  end
end
