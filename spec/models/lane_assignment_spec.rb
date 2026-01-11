require 'rails_helper'

RSpec.describe LaneAssignment, type: :model do
  let(:lane_number) { 1 }

  describe "validations" do
    context "when lane number is missing" do
      let!(:lane_number) { nil }

      it "requires lane number" do
        lane_assignment = build(:lane_assignment, lane_number: lane_number)

        expect(lane_assignment).not_to be_valid
        expect(lane_assignment.errors[:lane_number]).to include("can't be blank")
      end
    end
  end
end
