
let currentUser = null;
let STORAGE_KEY = "ipt_demo_v1"
let editingDeptIndex = null;
let editingAccountIndex = null;
let editingEmployeeIndex = null;


window.db = {
    accounts: [],
    departments: [],
    employees: [],
    requests: []
};


function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        window.db = JSON.parse(saved);
    } else {

        window.db.accounts = [
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: "Password123!",
                role: "admin",
                verified: true
            }
        ];



        saveToStorage();
    }

    if (!window.db.employees) window.db.employees = [];
    if (!window.db.requests) window.db.requests = [];

    if (!window.db.departments || window.db.departments.length === 0) {
        window.db.departments = [
            { id: 1, name: "Engineering", description: "Software team" },
            { id: 2, name: "HR", description: "Human Resources" }
    ];
}

}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

//routing here v

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {
    let hash = window.location.hash || "#/";

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    let route = hash.replace("#/", "");

    let page = document.getElementById(route) || document.getElementById("home");
    page.classList.add("active");

    if (route === "profile") renderProfile();
    if (route === "accounts") renderAccounts();
    if (route === "requests") renderRequests();
    if (route === "employees") renderEmployees();
    if (route === "departments") renderDepartments();
    if (route === "accounts") renderAccounts();

}

window.addEventListener("hashchange", handleRouting);


//auth here v

function setAuthState(isAuth, user = null) {
    const body = document.body;

    if (isAuth) {
        body.classList.remove("not-authenticated");
        body.classList.add("authenticated");
        currentUser = user;

        document.getElementById("userDropdown").textContent = user.firstName;

        if (user.role === "admin") {
            body.classList.add("is-admin");
        }
    } else {
        body.classList.add("not-authenticated");
        body.classList.remove("authenticated", "is-admin");
        currentUser = null;

        document.getElementById("userDropdown").textContent = "User";
    }
}

//register here
function register() {
    let firstName = regFirstName.value.trim();
    let lastName = regLastName.value.trim();
    let email = regEmail.value.trim();
    let password = regPassword.value.trim();


    [regFirstName, regLastName, regEmail, regPassword].forEach(input => {
        input.classList.remove("is-invalid");
    });


    if (!firstName || !lastName || !email || !password) {
        alert("Please fill in all fields.");

        if (!firstName) regFirstName.classList.add("is-invalid");
        if (!lastName) regLastName.classList.add("is-invalid");
        if (!email) regEmail.classList.add("is-invalid");
        if (!password) regPassword.classList.add("is-invalid");

        return;
    }


    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        regPassword.classList.add("is-invalid");
        return;
    }


    let exists = window.db.accounts.find(acc => acc.email === email);
    if (exists) {
        alert("Email already exists!");
        regEmail.classList.add("is-invalid");
        return;
    }


    window.db.accounts.push({
        firstName,
        lastName,
        email,
        password,
        role: "user",
        verified: false
    });

    saveToStorage();
    localStorage.setItem("unverified_email", email);

    alert("Registration successful! Please verify your email.");
    navigateTo("#/verify");
}


function verifyEmail() {
    let email = localStorage.getItem("unverified_email");
    let account = window.db.accounts.find(acc => acc.email === email);

    if (account) {
        account.verified = true;
        saveToStorage();
        alert("Email verified!");
        navigateTo("#/login");
    }
}

function login() {
    let email = logEmail.value;
    let password = logPassword.value;

    let user = window.db.accounts.find(acc =>
        acc.email === email &&
        acc.password === password &&
        acc.verified
    );

    if (!user) {
        alert("Invalid credentials or email not verified");
        return;
    }

    localStorage.setItem("auth_token", email);
    setAuthState(true, user);
    navigateTo("#/profile");
}

function logout() {
    localStorage.removeItem("auth_token");
    setAuthState(false);
    navigateTo("#/");
}

//profile here v

function renderProfile() {
    if (!currentUser) return;

    profileInfo.innerHTML = `
        <div class="card p-3">
            <h4>${currentUser.firstName} ${currentUser.lastName}</h4>
            <p>Email: ${currentUser.email}</p>
            <p>Role: ${currentUser.role}</p>
        </div>
    `;
}


//admin accounts here v

function renderAccounts() {
    if (!currentUser || currentUser.role !== "admin") return;

    let html = `
        <table class="table table-bordered">
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    window.db.accounts.forEach((acc, index) => {
        html += `
            <tr>
                <td>${acc.firstName} ${acc.lastName}</td>
                <td>${acc.email}</td>
                <td>${acc.role}</td>
                <td>${acc.verified ? "✅" : "❌"}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1"
                        onclick="editAccount(${index})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1"
                        onclick="resetPassword(${index})">
                        Reset Password
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteAccount(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    accountsTable.innerHTML = html;
}

function saveAccount() {

    let firstName = document.getElementById("accFirstName").value.trim();
    let lastName = document.getElementById("accLastName").value.trim();
    let email = document.getElementById("accEmail").value.trim();
    let password = document.getElementById("accPassword").value.trim();
    let role = document.getElementById("accRole").value;
    let verified = document.getElementById("accVerified").checked;

    if (!firstName || !lastName || !email) {
        alert("Please fill required fields.");
        return;
    }

    if (editingAccountIndex !== null) {
        
        let acc = window.db.accounts[editingAccountIndex];
        acc.firstName = firstName;
        acc.lastName = lastName;
        acc.email = email;
        acc.role = role;
        acc.verified = verified;

        if (password) {
            acc.password = password;
        }

    } else {
        
        window.db.accounts.push({
            firstName,
            lastName,
            email,
            password: password || "123456",
            role,
            verified
        });
    }

    saveToStorage();
    hideAccountForm();
    renderAccounts();
}
function editAccount(index) {
    let acc = window.db.accounts[index];

    document.getElementById("accFirstName").value = acc.firstName;
    document.getElementById("accLastName").value = acc.lastName;
    document.getElementById("accEmail").value = acc.email;
    document.getElementById("accPassword").value = "";
    document.getElementById("accRole").value = acc.role;
    document.getElementById("accVerified").checked = acc.verified;

    editingAccountIndex = index;

    showAccountForm();
}

function deleteAccount(index) {

    let acc = window.db.accounts[index];

    if (acc.email === currentUser.email) {
        alert("You cannot delete your own account.");
        return;
    }

    if (!confirm("Delete this account?")) return;

    window.db.accounts.splice(index, 1);
    saveToStorage();
    renderAccounts();
}
function resetPassword(index) {

    let newPass = prompt("Enter new password:");
    if (!newPass) return;

    window.db.accounts[index].password = newPass;

    saveToStorage();
    alert("Password updated.");
}
function clearAccountForm() {
    document.getElementById("accFirstName").value = "";
    document.getElementById("accLastName").value = "";
    document.getElementById("accEmail").value = "";
    document.getElementById("accPassword").value = "";
    document.getElementById("accRole").value = "user";
    document.getElementById("accVerified").checked = false;
    editingAccountIndex = null;
}


//accounts show toggle v
function showAccountForm() {
    document.getElementById("accountFormContainer").classList.remove("d-none");
}

function hideAccountForm() {
    document.getElementById("accountFormContainer").classList.add("d-none");
    clearAccountForm();
}

//------------------------------------------------------------------------------------------------------------------//

//request modal v
function openRequestModal() {
    document.getElementById("requestItemsContainer").innerHTML = "";
    addRequestItem();

    let modal = new bootstrap.Modal(document.getElementById("requestModal"));
    modal.show();
}

function addRequestItem(name = "", qty = 1) {

    let container = document.getElementById("requestItemsContainer");

    let div = document.createElement("div");
    div.className = "d-flex mb-2 align-items-center";

    div.innerHTML = `
        <input type="text" class="form-control me-2 item-name"
            placeholder="Item name" value="${name}">

        <input type="number" class="form-control me-2 item-qty"
            style="width:80px" min="1" value="${qty}">

        <button class="btn btn-outline-danger btn-sm"
            onclick="this.parentElement.remove()">X</button>
    `;

    container.appendChild(div);
}

function submitRequest() {

    let type = document.getElementById("requestType").value;

    let items = [];

    document.querySelectorAll("#requestItemsContainer > div").forEach(row => {

        let name = row.querySelector(".item-name").value.trim();
        let qty = row.querySelector(".item-qty").value;

        if (name) {
            items.push({ name, qty });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    let request = {
        type,
        items,
        status: "Pending",
        date: new Date().toLocaleDateString(),
        employeeEmail: currentUser.email
    };

    window.db.requests.push(request);
    saveToStorage();

    bootstrap.Modal.getInstance(
        document.getElementById("requestModal")
    ).hide();

    renderRequests();
}

function renderRequests() {

    if (!currentUser) return;

    let userRequests = window.db.requests.filter(r =>
        r.employeeEmail === currentUser.email
    );

    let container = document.getElementById("requestsTable");

    if (userRequests.length === 0) {
        container.innerHTML = `
            <p>You have no requests yet.</p>
            <button class="btn btn-success" onclick="openRequestModal()">
                Create One
            </button>
        `;
        return;
    }

    let html = `
        <table class="table table-bordered">
        <thead>
            <tr>
                <th>Type</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
    `;

    userRequests.forEach(r => {

        let items = r.items.map(i =>
            `${i.name} (${i.qty})`
        ).join("<br>");

        html += `
            <tr>
                <td>${r.type}</td>
                <td>${items}</td>
                <td><span class="badge bg-warning">${r.status}</span></td>
                <td>${r.date}</td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
}
 //------------------------------------------------------------------------------------------------------------------//

//employees here 
function renderEmployees() {
    if (!currentUser || currentUser.role !== "admin") return;

    let container = document.getElementById("employeesTable");

    if (window.db.employees.length === 0) {
        container.innerHTML = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Dept</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="5" class="text-center">No employees.</td>
                    </tr>
                </tbody>
            </table>
        `;
        return;
    }

    let html = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Dept</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    window.db.employees.forEach((emp, index) => {

        let account = window.db.accounts.find(a => a.email === emp.email);
        let dept = window.db.departments.find(d => d.id == emp.deptId);

        html += `
            <tr>
                <td>${emp.id}</td>
                <td>${account ? account.firstName + " " + account.lastName : "Unknown"}</td>
                <td>${emp.position}</td>
                <td>${dept ? dept.name : ""}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2"
                        onclick="editEmployee(${index})">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-danger"
                        onclick="deleteEmployee(${index})">
                        Delete
                    </button>
                </td>

            </tr>
        `;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
}

function populateDepartmentDropdown() {
    let select = document.getElementById("empDept");

    if (!select) return;

    select.innerHTML = "";

    if (!window.db.departments || window.db.departments.length === 0) {
        select.innerHTML = `<option disabled>No departments available</option>`;
        return;
    }

    window.db.departments.forEach(dept => {
        select.innerHTML += `
            <option value="${dept.id}">${dept.name}</option>
        `;
    });
}

function saveEmployee() {

    let id = empId.value.trim();
    let email = empEmail.value.trim();
    let position = empPosition.value.trim();
    let deptId = Number(empDept.value.trim());
    let hireDate = empHireDate.value.trim();

    if (id == "" || !email || !position || !hireDate) {
        alert("Please fill all fields.");
        return;
    }


    let accountExists = window.db.accounts.find(acc => acc.email === email);
    if (!accountExists) {
        alert("User email does not exist in accounts.");
        return;
    }

    if (editingEmployeeIndex !== null) {

        let emp = window.db.employees[editingEmployeeIndex];

        emp.id = id;
        emp.email = email;
        emp.position = position;
        emp.deptId = Number(deptId);
        emp.hireDate = hireDate;

    } else {

        window.db.employees.push({
            id,
            email,
            position,
            deptId: Number(deptId),
            hireDate
        });
    }


    saveToStorage();
    hideEmployeeForm();
    renderEmployees();
}

function editEmployee(index) {

    let emp = window.db.employees[index];

    document.getElementById("empId").value = emp.id;
    document.getElementById("empEmail").value = emp.email;
    document.getElementById("empPosition").value = emp.position;
    document.getElementById("empHireDate").value = emp.hireDate;

    populateDepartmentDropdown();
    document.getElementById("empDept").value = emp.deptId;

    editingEmployeeIndex = index;

    showEmployeeForm();
}


function deleteEmployee(index) {
    if (!confirm("Delete this employee?")) return;

    window.db.employees.splice(index, 1);
    saveToStorage();
    renderEmployees();
}

function clearEmployeeForm() {
    document.getElementById("empId").value = "";
    document.getElementById("empEmail").value = "";
    document.getElementById("empPosition").value = "";
    document.getElementById("empHireDate").value = "";
    document.getElementById("empDept").selectedIndex = 0;

    editingEmployeeIndex = null;
}





//employee show toggle v
function showEmployeeForm() {
    document.getElementById("employeeFormContainer").classList.remove("d-none");
    populateDepartmentDropdown();
}
function hideEmployeeForm() {
    document.getElementById("employeeFormContainer").classList.add("d-none");
    clearEmployeeForm();
}

 //------------------------------------------------------------------------------------------------------------------//


//departments here v
function renderDepartments() {
    if (!currentUser || currentUser.role !== "admin") return;

    let container = document.getElementById("departmentsTable");

    if (window.db.departments.length === 0) {
        container.innerHTML = "<p>No departments available.</p>";
        return;
    }

    let html = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    window.db.departments.forEach((dept, index) => {
        html += `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.description || ""}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2"
                        onclick="editDepartment(${index})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteDepartment(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
}

//departments show toggle v
function showDepartmentForm() {
    document.getElementById("departmentFormContainer").classList.remove("d-none");
}

function hideDepartmentForm() {
    document.getElementById("departmentFormContainer").classList.add("d-none");
    clearDepartmentForm();
}


function clearDepartmentForm() {
    document.getElementById("deptName").value = "";
    document.getElementById("deptDescription").value = "";
    editingDeptIndex = null;
}

function saveDepartment() {

    let name = deptName.value.trim();
    let description = deptDescription.value.trim();

    if (!name) {
        alert("Department name is required.");
        return;
    }

    if (editingDeptIndex !== null) {

        window.db.departments[editingDeptIndex].name = name;
        window.db.departments[editingDeptIndex].description = description;
    } else {
    
        window.db.departments.push({
            id: Date.now(),
            name,
            description
        });
    }

    saveToStorage();
    hideDepartmentForm();
    renderDepartments();
}

function editDepartment(index) {
    let dept = window.db.departments[index];

    deptName.value = dept.name;
    deptDescription.value = dept.description || "";

    editingDeptIndex = index;

    showDepartmentForm();
}





//init
window.onload = function () {
    loadFromStorage();

    const token = localStorage.getItem("auth_token");
    if (token) {
        let user = window.db.accounts.find(acc => acc.email === token);
        if (user) setAuthState(true, user);
    }

    handleRouting();
};