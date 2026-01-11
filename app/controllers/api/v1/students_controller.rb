class Api::V1::StudentsController < Api::V1::BaseController
  def index
    students = Student.all
    render json: students
  end

  def new; end

  def create
    @student = Student.new(student_params)

    if @student.save
      render json: @student.reload, status: :created
    else
      render_error(messages: @student.errors.full_messages, status: :unprocessable_entity)
    end
  end

  def student_params
    params.require(:student).permit(
      :first_name,
      :last_name
    )
  end
end
