# frozen_string_literal: true

module Api
  module V1
    class DashboardsController < ApplicationController
      include Authenticatable

      def librarian
        authorize :dashboard, :librarian?
        render json: Dashboards::LibrarianSummary.call, status: :ok
      end

      def member
        authorize :dashboard, :member?
        render json: Dashboards::MemberSummary.call(current_user), status: :ok
      end
    end
  end
end
