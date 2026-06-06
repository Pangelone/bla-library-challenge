Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      delete "auth/logout", to: "auth#logout"

      resources :books
      resources :borrowings, only: [:index, :create] do
        member do
          patch :return, action: :return_book
        end
      end

      get "dashboard/librarian", to: "dashboards#librarian"
      get "dashboard/member", to: "dashboards#member"
    end
  end
end
