# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_01_09_045837) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "lane_assignments", force: :cascade do |t|
    t.bigint "race_id", null: false
    t.bigint "student_id", null: false
    t.integer "lane_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["race_id", "lane_number"], name: "index_lane_assignments_on_race_id_and_lane_number", unique: true
    t.index ["race_id", "student_id"], name: "index_lane_assignments_on_race_id_and_student_id", unique: true
    t.index ["race_id"], name: "index_lane_assignments_on_race_id"
    t.index ["student_id"], name: "index_lane_assignments_on_student_id"
  end

  create_table "race_results", force: :cascade do |t|
    t.bigint "race_id", null: false
    t.bigint "student_id", null: false
    t.integer "place", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["race_id", "student_id"], name: "index_race_results_on_race_id_and_student_id", unique: true
    t.index ["race_id"], name: "index_race_results_on_race_id"
    t.index ["student_id"], name: "index_race_results_on_student_id"
  end

  create_table "races", force: :cascade do |t|
    t.string "name", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "students", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "lane_assignments", "races"
  add_foreign_key "lane_assignments", "students"
  add_foreign_key "race_results", "races"
  add_foreign_key "race_results", "students"
end
