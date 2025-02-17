# Page Design

**A. User Management (Admin Only)**

- **List Page (`/admin/users`)**
    - **Purpose:** Display a list of all users in the system and provide tools for searching, filtering, and managing them.
    - **Layout:**
        - **Header:**
            - Page Title: "User Management"
            - "Add User" button (redirects to `/admin/users/new`)
        - **Filters/Search:**
            - Search bar (for searching by name, email, etc.)
            - Dropdown filters:
                - "Status" (Active, Inactive)
                - "Role" (Admin, Cluster Admin, Business Unit Manager, etc.)
        - **User List (Table):**
            - Columns:
                - Name (linked to `/admin/users/[id]`)
                - Email
                - Role(s)
                - Status (Active/Inactive - with a visual indicator)
                - Last Login (Date/Time)
                - Actions
        - **Pagination:** At the bottom of the list if needed
    - **Content:**
        - User data: Name, email, role, status, last login.
        - Filtering options for quick user location.
    - **Actions:**
        - "Add User" (button)
        - Search
        - Filtering
        - Sorting (on column headers)
        - Actions Column:
            - "View" (link to `/admin/users/[id]`)
            - "Edit" (link to `/admin/users/[id]/edit` or inline modal)
            - "Deactivate/Activate" (toggle status)
            - "Delete" (with confirmation modal)
    - **Structure:**
        
        ```html
        <Page>
          <PageHeader>
            <PageTitle>User Management</PageTitle>
            <Button onClick={redirectToCreateUser}>Add User</Button>
          </PageHeader>
          <Filters>
            <SearchInput placeholder="Search users..." />
            <SelectFilter label="Status" options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} />
            <SelectFilter label="Role" options={...roleOptions} />
          </Filters>
          <DataTable columns={userColumns} data={users} />
          <Pagination />
        </Page>
        
        ```
        
- **View Page (`/admin/users/[id]`)**
    - **Purpose:** Display detailed information about a specific user.
    - **Layout:**
        - **Header:**
            - Page Title: "User Details"
            - Back Button (to `/admin/users`)
            - Actions Dropdown:
                - "Edit" (link to `/admin/users/[id]/edit`)
                - "Deactivate/Activate"
                - "Delete"
                - "Impersonate User" (careful with security implications)
        - **User Details Section:**
            - Name
            - Email
            - Role(s)
            - Status
            - Last Login
            - Created At
            - Updated At
        - **Permissions Section:**
            - List of granted permissions.
            - Editable list of permissions.
    - **Content:**
        - Full user details including metadata.
        - Detailed permission list.
    - **Actions:**
        - "Edit"
        - "Deactivate/Activate"
        - "Delete"
        - "Impersonate User"
        - Update Permissions
    - **Structure:**
        
        ```html
        <Page>
          <PageHeader>
            <PageTitle>User Details</PageTitle>
            <BackButton href="/admin/users" />
            <ActionsDropdown>
              <DropdownItem onClick={redirectToEdit}>Edit</DropdownItem>
              <DropdownItem onClick={toggleActive}>Deactivate/Activate</DropdownItem>
              <DropdownItem onClick={deleteUser}>Delete</DropdownItem>
              <DropdownItem onClick={impersonateUser}>Impersonate User</DropdownItem>
            </ActionsDropdown>
          </PageHeader>
          <UserDetails>
            <DetailItem label="Name">{user.name}</DetailItem>
            <DetailItem label="Email">{user.email}</DetailItem>
            <DetailItem label="Role">{user.role}</DetailItem>
            </UserDetails>
          <PermissionsSection>
            <EditablePermissionList permissions={user.permissions} onUpdate={updatePermissions} />
          </PermissionsSection>
        </Page>
        
        ```
        
- **Add User Form (`/admin/users/new`)**
    - **Purpose:** Create a new user account.
    - **Layout:**
        - **Header:**
            - Page Title: "Create User"
            - Back Button (to `/admin/users`)
        - **Form:**
            - Name (text input)
            - Email (email input)
            - Password (password input)
            - Confirm Password (password input)
            - Role(s) (multi-select dropdown)
            - Status (Active/Inactive radio buttons or toggle)
            - "Create User" button
            - "Cancel" button (redirects to `/admin/users`)
        - **Validation messages under each field**
    - **Content:**
        - Form fields for all required user information.
    - **Actions:**
        - "Create User" (submits the form)
        - "Cancel" (redirects to `/admin/users`)
    - **Structure:**
        
        ```html
        <Page>
          <PageHeader>
            <PageTitle>Create User</PageTitle>
            <BackButton href="/admin/users" />
          </PageHeader>
          <Form onSubmit={handleSubmit}>
            <TextInput label="Name" name="name" register={register} errors={errors} />
            <EmailInput label="Email" name="email" register={register} errors={errors} />
            <PasswordInput label="Password" name="password" register={register} errors={errors} />
            <PasswordInput label="Confirm Password" name="confirmPassword" register={register} errors={errors} />
            <SelectMultiple label="Roles" name="roles" register={register} options={roleOptions} errors={errors} />
            <RadioGroup label="Status" name="status" register={register} options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} errors={errors} />
            <Button type="submit">Create User</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Form>
        </Page>
        
        ```
        
- **Edit User Form (`/admin/users/[id]/edit`)**
    - **Purpose:** Modify an existing user account. Very similar to "Add User" but pre-populated.
    - **Layout:** (Almost identical to Add User, but with pre-filled values)
        - **Header:**
            - Page Title: "Edit User"
            - Back Button (to `/admin/users/[id]`)
        - **Form:** (Pre-populated with existing user data)
            - Name (text input)
            - Email (email input - maybe disabled)
            - Password (password input - only if changing) - Add checkbox "change password"
            - Confirm Password (password input)
            - Role(s) (multi-select dropdown)
            - Status (Active/Inactive radio buttons)
            - "Update User" button
            - "Cancel" button (redirects to `/admin/users/[id]`)
        - **Validation messages under each field**
    - **Content:**
        - Form fields pre-populated with the user's current data.
    - **Actions:**
        - "Update User" (submits the form)
        - "Cancel" (redirects to `/admin/users/[id]`)
    - **Structure:** (Very similar to Add User, but with pre-population)
        
        ```html
        <Page>
          <PageHeader>
            <PageTitle>Edit User</PageTitle>
            <BackButton href={`/admin/users/${userId}`} />
          </PageHeader>
          <Form onSubmit={handleSubmit}>
            <TextInput label="Name" name="name" register={register} errors={errors} defaultValue={user.name} />
            <EmailInput label="Email" name="email" register={register} errors={errors} defaultValue={user.email} disabled />
            <CheckboxInput label="Change Password" name="changePassword" register={register} />
            {watch('changePassword') && (
              <>
                <PasswordInput label="Password" name="password" register={register} errors={errors} />
                <PasswordInput label="Confirm Password" name="confirmPassword" register={register} errors={errors} />
              </>
            )}
            <SelectMultiple label="Roles" name="roles" register={register} options={roleOptions} errors={errors} defaultValue={user.roles} />
            <RadioGroup label="Status" name="status" register={register} options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} errors={errors} defaultValue={user.status} />
            <Button type="submit">Update User</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Form>
        </Page>
        
        ```
        
    - **Page Flow (User Management):**
        1. User navigates to `/admin/users` (list page).
        2. User can search, filter, and sort the list.
        3. User clicks "Add User" -> navigates to `/admin/users/new` (add form).
        4. User fills out the form and clicks "Create User" -> new user is created, and the user is redirected to `/admin/users`.
        5. User clicks "View" on a user in the list -> navigates to `/admin/users/[id]` (view page).
        6. User clicks "Edit" on the view page -> navigates to `/admin/users/[id]/edit` (edit form).
        7. User fills out the form and clicks "Update User" -> the user is updated, and the user is redirected to `/admin/users/[id]`.

**B. Cluster Management (Admin Only)**

- **List Page (`/admin/clusters`)**
    - **Purpose:** Display a list of all clusters in the system.
    - **Layout:**
        - **Header:**
            - Page Title: "Cluster Management"
            - "Add Cluster" button (redirects to `/admin/clusters/new`)
        - **Filters/Search:**
            - Search bar (for searching by name, id)
        - **Cluster List (Table):**
            - Columns:
                - Name (linked to `/admin/clusters/[id]`)
                - ID
                - Database Type (Shared/Dedicated)
                - Created At
                - Actions
    - **Content:**
        - Cluster details for each cluster.
    - **Actions:**
        - "Add Cluster"
        - Search
        - Actions Column:
            - "View"
            - "Edit"
            - "Delete"
- **View Page (`/admin/clusters/[id]`)**
    - **Purpose:** Display detailed information about a specific cluster.
    - **Layout:**
        - **Header:**
            - Page Title: "Cluster Details"
            - Back Button (to `/admin/clusters`)
            - Actions Dropdown:
                - "Edit"
                - "Delete"
        - **Cluster Details Section:**
            - Name
            - ID
            - Database Type
            - Connection String (masked for security)
            - Created At
            - Updated At
        - **Business Units Section:** (List of business units within the cluster)
            - Table with business unit name, ID, status, actions (linking to business unit detail).
    - **Content:**
        - Full cluster details.
        - List of business units.
    - **Actions:**
        - "Edit"
        - "Delete"
        - Manage Business Units (within the Business Units Section)
- **Add Cluster Form (`/admin/clusters/new`)**
    - **Purpose:** Create a new cluster.
    - **Layout:**
        - **Header:**
            - Page Title: "Create Cluster"
            - Back Button (to `/admin/clusters`)
        - **Form:**
            - Name (text input)
            - Database Type (radio buttons: Shared/Dedicated)
            - (If Shared) Schema Name Prefix (text input)
            - Admin User Email (email input)
            - Admin User Password (password input)
            - "Create Cluster" button
            - "Cancel" button
    - **Content:**
        - Form fields for cluster information and initial admin user.
    - **Actions:**
        - "Create Cluster"
        - "Cancel"
- **Edit Cluster Form (`/admin/clusters/[id]/edit`)**
    - **Purpose:** Modify an existing cluster.
    - **Layout:** (Similar to Add Cluster but pre-populated)
        - **Header:**
            - Page Title: "Edit Cluster"
            - Back Button (to `/admin/clusters/[id]`)
        - **Form:** (Pre-populated)
            - Name (text input)
            - Database Type (radio buttons - potentially disabled if dedicated)
            - (If Shared) Schema Name Prefix (text input) - Potentially disabled
            - "Update Cluster" button
            - "Cancel" button
    - **Content:**
        - Pre-populated form fields.
    - **Actions:**
        - "Update Cluster"
        - "Cancel"
    - **Page Flow (Cluster Management):** Similar to User Management – List -> Add/View -> Edit

**C. Business Unit Management (Cluster Admin or Higher)**

- **List Page (`/clusters/[clusterId]/business-units`)**
    - **Purpose:** Display a list of business units within a specific cluster.
    - **Layout:** Similar to the cluster management list, but with the cluster context displayed at the top (e.g., "Cluster: [Cluster Name]")
        - **Header:**
            - Page Title: "Business Unit Management"
            - "Add Business Unit" button
        - **Filters/Search:**
            - Search bar
        - **Business Unit List (Table):**
            - Name
            - ID
            - Template Used
            - Status
            - Created At
            - Actions
- **View Page (`/clusters/[clusterId]/business-units/[id]`)**
    - **Purpose:** Display detailed information about a specific business unit.
    - **Layout:** Similar to the cluster view page.
        - **Header:**
            - Page Title: "Business Unit Details"
            - Back Button
            - Actions Dropdown
        - **Business Unit Details Section:**
            - Name
            - ID
            - Template Used
            - Status
            - Settings (key-value pairs from template configuration)
        - **Users Section:** (List of users associated with the business unit)
- **Add Business Unit Form (`/clusters/[clusterId]/business-units/new`)**
    - **Purpose:** Create a new business unit within a cluster.
    - **Layout:**
        - **Header:**
            - Page Title: "Create Business Unit"
            - Back Button
        - **Form:**
            - Name
            - Template Selection (dropdown)
            - Template Configuration (dynamic form fields based on the selected template)
            - Initial Admin User (similar to cluster creation)
            - "Create Business Unit" button
            - "Cancel" button
- **Edit Business Unit Form (`/clusters/[clusterId]/business-units/[id]/edit`)**
    - **Purpose:** Modify an existing business unit.
    - **Layout:** Similar to the Add Business Unit form but pre-populated.

**Key Considerations for all Forms:**

- **Form Libraries:** Use a robust form library like React Hook Form with Zod for validation. This will simplify form management and validation.
- **Error Handling:** Display clear and helpful error messages to the user.
- **Loading States:** Show loading indicators when data is being fetched or submitted.
- **Accessibility:** Ensure all forms are accessible to users with disabilities (e.g., proper labels, keyboard navigation).
- **Confirmation Modals:** Use confirmation modals for potentially destructive actions (e.g., deleting users, clusters, or business units).
- **Dynamic Forms:** For template configuration, the form fields will need to dynamically change based on the selected template. React Hook Form can handle this with careful design.
- **Code Splitting:** Break larger forms into smaller, more manageable components to improve performance.
- **CSS and Styling**: Keep consistent use of Shadcn UI components to ensure a uniform look and feel of the website.