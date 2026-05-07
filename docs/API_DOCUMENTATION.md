# CineVault API Documentation

## Description
The CineVault API is a RESTful service that powers the CineVault digital rental platform. It provides endpoints for user authentication, film catalog management, DVD rental operations, member profile management, and user reviews.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Protected endpoints require a JSON Web Token (JWT) provided in the Authorization header using the Bearer schema:
```
Authorization: Bearer <token>
```
Tokens are generated via the `/api/auth/login` or `/api/auth/register` endpoints and possess a standard expiration of 24 hours.

## Interactive Documentation
Swagger UI documentation is accessible at: `http://localhost:5000/api-docs`

---

## Endpoints

### Authentication

#### POST `/api/auth/register`
Registers a new member account within the system.

**Request Parameters (JSON Body):**
| Field | Type | Required | Description |
|---|---|---|---|
| memberName | string | Yes | Full display name of the member |
| email | string | Yes | Unique email address serving as the login identifier |
| password | string | Yes | Minimum 8 characters in length |
| phone | string | No | Optional contact number |

**Success Response (HTTP 201):**
Returns the generated JWT and the newly created member object.

**Error Responses:**
- 409 Conflict: Email address is already registered.
- 500 Internal Server Error: System processing failure.

---

#### POST `/api/auth/login`
Authenticates a user and issues a JWT token for session management.

**Request Parameters (JSON Body):**
| Field | Type | Required |
|---|---|---|
| email | string | Yes |
| password | string | Yes |

**Success Response (HTTP 200):**
Returns the generated JWT and the authenticated member object.

**Error Responses:**
- 401 Unauthorized: Invalid authentication credentials.

---

#### GET `/api/auth/me`
Retrieves the profile data of the currently authenticated member.

**Authorization:** Required (JWT)

**Success Response (HTTP 200):**
Returns the member object, excluding sensitive fields such as the password hash.

---

### Films Catalog

#### GET `/api/films`
Retrieves a paginated list of film records, supporting optional filtering criteria.

**Query Parameters:**
| Field | Type | Default | Description |
|---|---|---|---|
| title | string | None | Filters by title utilizing case-insensitive regex |
| category | string | None | Filters by category ObjectId |
| page | number | 1 | Specifies the page number for pagination |
| limit | number | 12 | Specifies the number of items per page |

**Success Response (HTTP 200):**
Returns pagination metadata (total, page) and an array of film objects.

---

#### GET `/api/films/:id`
Retrieves detailed metadata for a single film, including inventory records of all associated physical copies.

**Success Response (HTTP 200):**
Returns the film object supplemented with a `copies` array and an `availableCopies` integer.

**Error Responses:**
- 404 Not Found: The specified film ID does not exist.

---

#### GET `/api/films/alerts/low-stock`
Retrieves a list of films where the available physical inventory is at or below the predefined threshold.

**Authorization:** Required (Administrator)

**Success Response (HTTP 200):**
Returns the aggregate count, the applied threshold, and an array of low-stock film objects.

---

#### POST `/api/films`
Creates a new film record within the catalog.

**Authorization:** Required (Administrator)

**Request Parameters (JSON Body):**
| Field | Type | Required |
|---|---|---|
| filmTitle | string | Yes |
| releaseDate | string (Date) | No |
| filmDuration | number | No |
| price | number | No |
| copies | number | No (Defaults to 1) |

**Success Response (HTTP 201):**
Returns a confirmation message and the created film object.

---

#### PUT `/api/films/:id`
Updates metadata for an existing film record.

**Authorization:** Required (Administrator)

**Success Response (HTTP 200):**
Returns a confirmation message and the updated film object.

---

#### DELETE `/api/films/:id`
Permanently removes a film record and all associated physical copy records from the database.

**Authorization:** Required (Administrator)

**Success Response (HTTP 200):**
Returns a confirmation message indicating successful deletion.

---

### Rental Transactions

#### POST `/api/rentals`
Initiates a new rental transaction. This operation deducts the appropriate funds from the member's wallet and reserves an available physical copy.

**Authorization:** Required (JWT)

**Request Parameters (JSON Body):**
| Field | Type | Required |
|---|---|---|
| filmId | string (ObjectId) | Yes |

**Success Response (HTTP 201):**
Returns a confirmation message, the rental transaction object, and the updated wallet balance.

**Error Responses:**
- 400 Bad Request: No physical copies are currently available for the requested film.
- 402 Payment Required: Insufficient funds in the member's digital wallet.
- 404 Not Found: The specified film ID does not exist.

---

#### GET `/api/rentals/my`
Retrieves the complete rental transaction history for the authenticated member.

**Authorization:** Required (JWT)

**Success Response (HTTP 200):**
Returns an array of rental transaction objects.

---

#### PUT `/api/rentals/:id/return`
Processes the return of a physical DVD copy. This operation calculates and assesses overdue penalties if applicable.

**Authorization:** Required (Administrator)

**Success Response (HTTP 200):**
Returns a confirmation message, the calculated overdue cost, and the updated rental transaction object.

---

#### GET `/api/rentals`
Retrieves all rental transaction records across the system, supporting optional filtering.

**Authorization:** Required (Administrator)

**Query Parameters:**
| Field | Type | Description |
|---|---|---|
| status | string | Filters by status (`active` or `returned`) |
| memberId | string | Filters transactions by a specific member |

---

### Member Management

#### GET `/api/members/profile`
Retrieves the comprehensive profile of the authenticated member.

**Authorization:** Required (JWT)

---

#### PUT `/api/members/profile`
Updates demographic information for the authenticated member.

**Authorization:** Required (JWT)

**Request Parameters (JSON Body):**
| Field | Type |
|---|---|
| memberName | string |
| phone | string |
| dob | string (Date) |

---

#### PUT `/api/members/profile/picture`
Uploads and processes a profile image. The image payload must be Base64-encoded.

**Authorization:** Required (JWT)

**Request Parameters (JSON Body):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Success Response (HTTP 200):**
Returns a confirmation message and the processed image data or reference path.

---

#### GET `/api/members`
Retrieves a directory of all registered members.

**Authorization:** Required (Administrator)

---

#### DELETE `/api/members/:id`
Permanently removes a member account from the system.

**Authorization:** Required (Administrator)

---

### Catalog Taxonomy

#### GET `/api/categories`
Retrieves all established film categories.

**Success Response (HTTP 200):**
Returns an array of category objects.

#### POST `/api/categories`
Creates a new film category.
**Authorization:** Required (Administrator)

#### PUT `/api/categories/:id`
Updates an existing film category.
**Authorization:** Required (Administrator)

#### DELETE `/api/categories/:id`
Removes a film category.
**Authorization:** Required (Administrator)

#### GET `/api/actors`
Retrieves all actor records, supporting optional partial name matching via the `name` query parameter.

**Success Response (HTTP 200):**
Returns an array of actor objects.

#### POST `/api/actors`
Creates a new actor record.
**Authorization:** Required (Administrator)

#### PUT `/api/actors/:id`
Updates an existing actor record.
**Authorization:** Required (Administrator)

#### DELETE `/api/actors/:id`
Removes an actor record.
**Authorization:** Required (Administrator)

---

### User Reviews

#### POST `/api/reviews`
Submits a user review and rating for a specific film.

**Authorization:** Required (JWT)

**Request Parameters (JSON Body):**
| Field | Type | Required | Description |
|---|---|---|---|
| filmId | string | Yes | The ObjectId of the film being reviewed |
| stars | number | Yes | A numerical rating between 1 and 5 |
| text | string | No | Optional qualitative assessment (maximum 500 characters) |

**Success Response (HTTP 201):**
Returns a confirmation message and the created review object.

**Error Responses:**
- 409 Conflict: The member has already submitted a review for this film.

---

#### GET `/api/reviews/:filmId`
Retrieves all publicly available reviews for a designated film.

**Success Response (HTTP 200):**
Returns an array of review objects, the calculated average rating, and the total review count.

---

#### DELETE `/api/reviews/:id`
Removes a specific review. This action is restricted to the review author or system administrators.

**Authorization:** Required (JWT)

**Error Responses:**
- 403 Forbidden: The authenticated user lacks permission to delete the specified review.

---

## Integration Guidelines

1. Ensure the `Content-Type: application/json` header is present for all POST and PUT operations.
2. Maintain secure storage practices for JWT tokens (e.g., memory storage or secure cookies).
3. Implement standardized handling for 401 Unauthorized responses, typically enforcing a session termination and redirection to the authentication interface.
4. Utilize pagination parameters (`page` and `limit`) when retrieving large datasets to optimize network performance.
5. Monitor the `lowStock` boolean flag within film responses to facilitate proactive inventory management.

## Standardized Error Format
System errors are returned in a consistent JSON structure:
```json
{
  "message": "Descriptive error rationale intended for developer integration."
}
```
