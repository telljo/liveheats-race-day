Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

# HTML entrypoints (React mounts into the views)
root "races#index"
get "/races",     to: "races#index"
get "/races/new", to: "races#new"
get "/races/:id", to: "races#show", as: :race

  namespace :api do
    namespace :v1 do
      resources :races, only: [ :index, :show, :create, :update ] do
        resources :race_results, only: [ :index ]
      end
    end
  end
end
