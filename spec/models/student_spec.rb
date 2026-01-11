require 'rails_helper'

RSpec.describe Student, type: :model do
  let(:first_name) { "Harry" }
  let(:last_name) { "Potter" }

  describe "validations" do
    context "when first name is missing" do
      let!(:first_name) { nil }

      it "requires first name" do
        student = build(:student, first_name:, last_name:)

        expect(student).not_to be_valid
        expect(student.errors[:first_name]).to include("can't be blank")
      end
    end

    context "when last name is missing" do
      let!(:last_name) { nil }

      it "requires last name" do
        student = build(:student, first_name:, last_name:)

        expect(student).not_to be_valid
        expect(student.errors[:last_name]).to include("can't be blank")
      end
    end
  end
end
