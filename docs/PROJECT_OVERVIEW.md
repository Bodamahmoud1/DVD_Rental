# CineVault Project Overview

This document outlines the strategic objectives, operational scope, and data entities of the CineVault digital rental platform.

## Executive Summary

CineVault is a full-stack web application designed to transition traditional physical media rental operations into a digital management system. The application serves a dual purpose: providing an intuitive, seamless browsing and rental experience for consumers, and delivering a comprehensive administrative dashboard for inventory and transaction oversight.

The application relies on a modern client-server architecture, utilizing a React-based Single Page Application (SPA) on the frontend and an Express.js REST API on the backend, ensuring scalability, performance, and maintainability.

## Strategic Objectives

1. **Automated Inventory Management:** Replace manual transaction recording with an automated system capable of tracking DVD availability, processing rentals, enforcing due dates, and calculating late fees.
2. **Modern User Interface:** Provide a responsive, accessible frontend interface that adheres to contemporary web design standards, ensuring cross-device compatibility.
3. **Robust Access Control:** Implement industry-standard security protocols, utilizing JSON Web Tokens (JWT) to enforce role-based access control (RBAC) and protect sensitive user data.
4. **Comprehensive Data Administration:** Facilitate full CRUD operations for all system entities, enabling administrators to manage the catalog, user base, and transactional records effectively.
5. **Operational Insights:** Equip system administrators with actionable data regarding low-stock inventory, rental frequency, and platform usage metrics.

## Operational Scope

### In Scope
- **User Management:** Secure registration, authentication protocols, and profile management including localized media storage.
- **Catalog Navigation:** Advanced search algorithms, categorical filtering, and optimized data pagination for large datasets.
- **Transaction Processing:** End-to-end rental lifecycle management, encompassing virtual wallet deductions, a standardized 7-day rental period, and automated overdue fee assessments.
- **User Engagement:** Implementation of a user rating and review system, as well as a wishlist feature for future rentals.
- **Administrative Control:** Centralized management of the film catalog, member accounts, physical inventory tracking, and return processing.
- **API Documentation:** Comprehensive, standardized REST API documentation utilizing Swagger specifications.

### Out of Scope
- Integration with external financial payment gateways.
- Automated email or SMS notification services.
- Real-time communication or user messaging modules.
- Development of native mobile applications for iOS or Android platforms.

## Core Data Entities

The system architecture is built upon several foundational data models:

### Member
The primary user entity within the platform. Members undergo secure registration and are allocated a digital wallet balance (default £30.00). The member profile tracks transaction history, submitted reviews, and wishlist items. Administrative members possess elevated permissions for system oversight.

### FilmTitle
The central entity representing an individual film within the catalog. It encapsulates comprehensive metadata including title, release year, duration, aggregate rating, descriptive text, external media URLs, and standardized rental pricing.

### FilmCategory
The categorical classification system (e.g., Action, Drama, Thriller) used to segment the catalog. This entity facilitates structured data retrieval and enhances user navigation.

### Actor
Represents individuals credited in the films. Actors are associated with `FilmTitle` entities via a many-to-many relationship, permitting advanced search capabilities across the catalog.

### FilmCopy
Represents the physical inventory of a specific `FilmTitle`. The system tracks the exact number of physical units available. The availability status of each unit is monitored via a specific boolean flag, facilitating accurate inventory calculations.

### Rental
The transactional entity recording the lifecycle of a DVD rental. It establishes a relational link between a `Member` and a specific `FilmCopy`. The entity tracks the checkout date, the designated return date, the actual return date, and all associated financial calculations, including overdue penalties.

### Review
User-generated feedback associated with a `FilmTitle`. Members may submit a single review per film, comprising a numerical rating (1-5) and an optional qualitative assessment. Reviews are aggregated to influence the overall rating of the respective film.
