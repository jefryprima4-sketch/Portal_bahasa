# Quiz Creation System Enhancement Design

## Overview
Enhance the existing quiz creation system for instructors in the Portal Bahasa platform to improve usability, add validation, and provide better feedback mechanisms.

## Scope
Focus on enhancing:
1. Quiz creation form (`src/app/(dashboard)/instructor/courses/[id]/quizzes/create/page.tsx`)
2. Quiz creation actions (`src/app/(dashboard)/instructor/courses/[id]/quizzes/actions.ts`)
3. Quiz editing/question addition (`src/app/(dashboard)/instructor/courses/[id]/quizzes/[quizId]/edit/page.tsx`)

## Goals
- Improve user experience with better validation and feedback
- Prevent invalid quiz/question creation
- Provide clear success/error states
- Maintain existing functionality
- Follow existing code patterns and conventions

## Design Details

### 1. Enhanced Quiz Creation Page

#### Current State
Basic form with title, duration, passing grade, and checkbox options.

#### Enhancements
- **Client-side Validation**: Validate required fields (title, duration) before submission
- **Loading States**: Show submit button state during API calls
- **Error Handling**: Display form-level and field-level errors from Supabase
- **Success Feedback**: Show toast notification on successful quiz creation
- **Form Reset**: Clear form after successful submission
- **Accessibility**: Proper labels, focus management, ARIA attributes

#### Component Structure
```typescript
export default function CreateQuizPage({ params }: { params: Promise<{ id: string> }>) {
  // State for form validation, loading, errors
  // Handle form submission with validation
  // Show success/error messages
  // Render enhanced form with validation indicators
}
```

### 2. Enhanced Quiz Creation Actions

#### Current State
Basic Supabase insert operations with minimal error handling.

#### Enhancements
- **Input Validation**: Validate form data before DB operations
- **Better Error Messages**: Specific error messages for validation failures
- **Type Safety**: Improved TypeScript types for form data and returns
- **Optimistic Updates**: Consider optimistic UI updates where appropriate

#### Function Enhancements
```typescript
export async function createQuiz(formData: FormData) {
  // Validate required fields
  // Validate data types (duration as number, etc.)
  // Attempt Supabase insert with proper error handling
  // Return structured error/success responses
}

export async function addQuestion(formData: FormData) {
  // Validate question type and required fields
  // For MCQ: ensure at least one correct answer, no empty answers
  // For Essay: validate question text
  // Handle Supabase operations with transaction-like behavior
  // Return detailed error/success information
}
```

### 3. Enhanced Quiz Editing Page

#### Current State
Displays existing questions and provides form to add new questions.

#### Enhancements
- **Question Type Switching**: Dynamically show/hide answer fields based on question type
- **Answer Validation**: 
  - MCQ: Ensure at least one correct answer, prevent empty answers
  - Essay: Validate question text is present
- **Improved UX**: Better visual feedback for question type selection
- **Error Prevention**: Disable submit button when form is invalid
- **Accessibility**: Proper form labeling and keyboard navigation

#### Component Enhancements
```typescript
// Add state management for question type
// Conditional rendering of answer fields based on type
// Validation logic before enabling submit button
// Improved visual feedback for required fields
```

### 4. Data Flow

#### Quiz Creation Flow
1. Instructor navigates to quiz creation page for a course
2. Instructor fills out form with client-side validation
3. On submit: 
   - Prevent default if validation fails
   - Show loading state
   - Call `createQuiz` action
   - On success: show notification, reset form, redirect to quiz edit
   - On error: show error notification, hide loading state
4. After creation, instructor is redirected to edit page to add questions

#### Question Addition Flow
1. Instructor selects question type (MCQ/Essay)
2. Form dynamically adjusts to show relevant fields
3. Instructor fills question and answer details
4. On submit:
   - Validate based on question type
   - Show loading state
   - Call `addQuestion` action
   - On success: show notification, reset form, refresh question list
   - On error: show error notification, hide loading state

### 5. Error Handling Strategy

#### Client-Side Validation
- Required fields: visual indicators, prevent submission
- Field types: number validation for duration/passing_grade
- Quiz-specific: duration > 0, passing_grade between 0-100
- Question-specific: MCQ requires at least one correct answer

#### Server-Side Validation
- Supabase constraints (not null, unique, etc.)
- Action-level validation as backup
- Clear error messages mapped to UI fields

#### User Feedback
- Toast notifications for success/errors
- Inline field validation errors
- Loading states on submit buttons
- Error boundaries for unexpected failures

### 6. Architecture Considerations

#### State Management
- Use React hooks (useState, useEffect) for form state
- Consider React Query for optimistic updates (future enhancement)
- Keep state localized to components where appropriate

#### Styling & Components
- Use existing UI components from `@/components/ui`
- Follow Tailwind CSS patterns already established
- Maintain consistent spacing, typography, and color usage

#### Accessibility
- Proper form labels and associated inputs
- Keyboard navigable interface
- ARIA live regions for dynamic error messages
- Sufficient color contrast for error/success states

#### Performance
- Minimize re-renders with proper state partitioning
- Debounce expensive validations if needed
- Optimistic UI updates for better perceived performance

## Implementation Plan (High-Level)

### Phase 1: Quiz Creation Enhancement
1. Enhance `create/page.tsx` with validation and loading states
2. Enhance `createQuiz` action with better validation and error handling
3. Add success/error toast notifications

### Phase 2: Question Addition Enhancement  
1. Enhance `[quizId]/edit/page.tsx` with question type switching
2. Add validation logic for MCQ/Essay questions
3. Enhance `addQuestion` action with input validation
4. Improve UX feedback during question addition

### Phase 3: Polish & Testing
1. Accessibility audit and fixes
2. Edge case testing (network errors, validation edge cases)
3. Performance optimization
4. Documentation updates

## Success Criteria

### Functional
- [ ] Quiz creation form prevents submission with invalid data
- [ ] Loading states prevent duplicate submissions
- [ ] Clear success/error feedback for all operations
- [ ] MCQ questions require at least one correct answer
- [ ] Essay questions validate question text presence
- [ ] All existing functionality preserved

### Technical
- [ ] Follow existing code patterns and conventions
- [ ] Proper TypeScript usage throughout
- [ ] No console errors or warnings in development
- [ ] Accessible keyboard navigation
- [ ] Responsive design on various screen sizes

### User Experience
- [ ] Intuitive form flow with clear visual feedback
- [ ] Error messages guide users to correct issues
- [ ] Success actions provide clear confirmation
- [ ] Form state preserved appropriately during errors

## Open Questions & Decisions

### 1. Toast Notification System
- Should we implement a custom toast system or use existing one?
- Decision: Check if project already has notification system; if not, implement simple toast

### 2. Validation Library
- Should we use a form validation library (Zod, Yup) or custom validation?
- Decision: Start with custom validation for simplicity, evaluate if complexity grows

### 3. Optimistic Updates
- Should we implement optimistic UI updates for better perceived performance?
- Decision: Defer to Phase 2 after basic enhancements are working

### 4. Question Reordering
- Should we add drag-and-drop question reordering?
- Decision: Stretch goal for after core enhancements are complete

## Related Files
- `src/app/(dashboard)/instructor/courses/[id]/quizzes/create/page.tsx`
- `src/app/(dashboard)/instructor/courses/[id]/quizzes/actions.ts`
- `src/app/(dashboard)/instructor/courses/[id]/quizzes/[quizId]/edit/page.tsx`
- `src/lib/supabase/server.ts` (existing Supabase client)
- `src/components/ui/*` (existing UI components)

## Dependencies
- Existing Supabase setup
- Existing UI component library
- Next.js 15 + React 19
- TypeScript 5.7+

## Risks & Mitigations

### Risk: Breaking existing functionality
- Mitigation: Write enhancement as additive changes, test thoroughly

### Risk: Over-engineering simple forms
- Mitigation: Follow YAGNI principle, enhance incrementally

### Risk: Inconsistent UX across forms
- Mitigation: Follow existing patterns in the codebase

### Risk: Validation complexity growth
- Mitigation: Start simple, refactor to validation library if needed

## Next Steps
1. Review and approve this design document
2. Proceed to implementation planning using `superpowers:writing-plans` skill
3. Implement enhancements in phases as outlined
4. Test thoroughly before moving to next feature