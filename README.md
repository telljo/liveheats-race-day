# Liveheats Coding Challenge

This repository contains my solution for the Liveheats Coding Challenge, built with Ruby on Rails on the backend and React on the frontend.

## Table of Contents
- [Overview](#overview)
- [Design Decisions](#design-decisions)
  - [Rails + React Architecture](#rails--react-architecture)
  - [Domain-First Validation](#domain-first-validation)
  - [Explicit Race Lifecycle](#explicit-race-lifecycle)
  - [Testing Strategy](#testing-strategy)
  - [Extension Readiness](#extension-readiness)
- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [Tests](#tests)
- [Rubocop](#rubocop)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Assumptions & Scope](#assumptions--scope)
- [License](#license)

## Overview

This demo application showcases a modern Rails + React architecture for building a clean, responsive, and maintainable web application. Rails is used as the primary backend for data modelling, validation, business logic, and routing, while React is responsible for rendering the user interface and handling client-side interactions.

The goal of the project is to demonstrate how a well-structured API-driven Rails application can work seamlessly with a React frontend to deliver a fast and dynamic user experience without unnecessary complexity.

## Design Decisions

The primary goal of this solution was to prioritise correctness, clarity, and testability of the domain logic over breadth of features or visual polish.

### Rails + React Architecture
Rails was chosen as the backend framework to model the core domain concepts (Races, Lane Assignments, and Results) and to enforce business rules close to the data. React was chosen for the frontend to provide a responsive, SPA-style user experience and to keep UI concerns clearly separated from domain logic.

### Domain-First Validation
Race rules (such as minimum students, lane uniqueness, and valid placement/tie handling) are enforced at both the client and server level instead of relying solely on frontend validation.

In particular:
- Placement and tie logic is implemented as pure, deterministic functions
- Validation runs independently of UI state
- Invalid race states are impossible to persist

### Explicit Race Lifecycle
- Races move through explicit states (draft → completed) rather than relying on implicit assumptions.
- This:
  - Prevents results being entered before a race is valid
  - Keeps user flows predictable
  - Makes future extensions (editing, re-running, or aggregating races) easier to reason about

### Testing Strategy
- Testing effort was deliberately focused on domain and backend logic, where correctness is most critical.
- Core race rules and placement validation are fully unit tested
- Business logic is tested independently of UI concerns
- Tests are fast, deterministic, and easy to reason about

Frontend testing was considered but ultimately kept out of scope due to time constraints, with the conscious trade-off that:
- UI logic remains relatively simple and explicit
- Domain rules are protected regardless of frontend behaviour
- Frontend tests could be added later without refactoring core logic

### Extension Readiness
- Although the implementation is intentionally minimal, the design supports future extensions such as:
  - Editing or re-running races
  - Adding timing data
  - Multi-teacher or multi-school support

## Features
- Clear separation of backend (Rails) and frontend (React) responsibilities
- RESTful API design with predictable data contracts
- Client-side state management for smooth user interactions
- Progressive race creation, lane assignment, and results management
- Focus on clarity, correctness, and maintainability over over-engineering
- Follow Rails conventions while also integrating React on the frontend

## Architecture
- Backend: Ruby on Rails
  - Domain-driven models and validations
  - Service objects for race lifecycle logic
  - JSON API endpoints consumed by the frontend
- Frontend: React (via Vite)
  - Component-driven UI
  - Local state for form interactions and draft editing
  - Explicit API calls for persistence and transitions
- Database: PostgreSQL

This structure mirrors how Rails and React are commonly used together in production systems, allowing each layer to play to its strengths.

## Setup

1. Clone the repository:

```sh
git clone https://github.com/telljo/liveheats-race-day.git
cd liveheats-race-day
```

2. Install backend dependencies:

```sh
bundle install
```

3. Set up the database:

```sh
rails db:create db:migrate
```

4. Seed the database:

```sh
bundle exec rake db:seed
```

5. Start the development environment:

```sh
bin/dev
```

6. Visit http://localhost:3000 in your browser.

## Tests

Tests for the Ruby on Rails code are written in RSpec. The full spec suite can be run with:
```sh
bundle exec rspec
```

## Rubocop

```sh
bundle exec rubocop
```

## Usage

The main branch represents the complete solution for the coding challenge, including race setup, lane assignment, and result validation flows.

The application assumes a single teacher managing races for a single school, allowing the focus to remain on core domain logic rather than authentication or multi-tenant concerns.

## Technologies Used

- Ruby on Rails
- React
- PostgreSQL

## Assumptions & Scope

- Single-school, single-user (teacher) system
- Authentication, authorization, and roles are out of scope
- Styling and UX focus on clarity and usability rather than visual polish
- Designed to be extendable rather than exhaustive
- Frontend testing was out of scope due to time constraints

## License

This project is open source and available under the [MIT License](LICENSE).