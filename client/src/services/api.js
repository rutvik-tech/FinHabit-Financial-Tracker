const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const authenticatedRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("finhabitToken");

  const response = await apiRequest(
    endpoint,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    }
  );

  const method = (
    options.method || "GET"
  ).toUpperCase();

  if (
    method !== "GET" &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new Event("finhabit:data-updated")
    );
  }

  return response;
};

export const registerUser = async (userData) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });
};

export const loginUser = async (userData) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData)
  });
};

export const addExpense = async (expenseData) => {
  return authenticatedRequest("/expenses", {
    method: "POST",
    body: JSON.stringify(expenseData)
  });
};

export const getExpenses = async () => {
  return authenticatedRequest("/expenses");
};

export const updateExpense = async (expenseId, expenseData) => {
  return authenticatedRequest(`/expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify(expenseData)
  });
};

export const deleteExpense = async (expenseId) => {
  return authenticatedRequest(`/expenses/${expenseId}`, {
    method: "DELETE"
  });
};

export const addIncome = async (incomeData) => {
  return authenticatedRequest("/income", {
    method: "POST",
    body: JSON.stringify(incomeData)
  });
};

export const getIncome = async () => {
  return authenticatedRequest("/income");
};

export const updateIncome = async (incomeId, incomeData) => {
  return authenticatedRequest(`/income/${incomeId}`, {
    method: "PUT",
    body: JSON.stringify(incomeData)
  });
};

export const deleteIncome = async (incomeId) => {
  return authenticatedRequest(`/income/${incomeId}`, {
    method: "DELETE"
  });
};

export const getHabits = async () => {
  return authenticatedRequest("/habits");
};

export const addHabit = async (habitData) => {
  return authenticatedRequest("/habits", {
    method: "POST",
    body: JSON.stringify(habitData)
  });
};

export const updateHabit = async (habitId, habitData) => {
  return authenticatedRequest(`/habits/${habitId}`, {
    method: "PUT",
    body: JSON.stringify(habitData)
  });
};

export const completeHabit = async (habitId) => {
  return authenticatedRequest(`/habits/${habitId}/complete`, {
    method: "PATCH"
  });
};

export const deleteHabit = async (habitId) => {
  return authenticatedRequest(`/habits/${habitId}`, {
    method: "DELETE"
  });
};

export const getGoals = async () => {
  return authenticatedRequest("/goals");
};

export const addGoal = async (goalData) => {
  return authenticatedRequest("/goals", {
    method: "POST",
    body: JSON.stringify(goalData)
  });
};

export const updateGoal = async (goalId, goalData) => {
  return authenticatedRequest(`/goals/${goalId}`, {
    method: "PUT",
    body: JSON.stringify(goalData)
  });
};

export const addMoneyToGoal = async (goalId, amount) => {
  return authenticatedRequest(`/goals/${goalId}/add-money`, {
    method: "PATCH",
    body: JSON.stringify({ amount })
  });
};

export const deleteGoal = async (goalId) => {
  return authenticatedRequest(`/goals/${goalId}`, {
    method: "DELETE"
  });
};

export const getWealthSnapshots = async () => {
  return authenticatedRequest("/wealth");
};

export const addWealthSnapshot = async (wealthData) => {
  return authenticatedRequest("/wealth", {
    method: "POST",
    body: JSON.stringify(wealthData)
  });
};

export const updateWealthSnapshot = async (snapshotId, wealthData) => {
  return authenticatedRequest(`/wealth/${snapshotId}`, {
    method: "PUT",
    body: JSON.stringify(wealthData)
  });
};

export const deleteWealthSnapshot = async (snapshotId) => {
  return authenticatedRequest(`/wealth/${snapshotId}`, {
    method: "DELETE"
  });
};

export const getBudgets = async () => {
  return authenticatedRequest("/budgets");
};

export const addBudget = async (budgetData) => {
  return authenticatedRequest("/budgets", {
    method: "POST",
    body: JSON.stringify(budgetData)
  });
};

export const updateBudget = async (budgetId, budgetData) => {
  return authenticatedRequest(`/budgets/${budgetId}`, {
    method: "PUT",
    body: JSON.stringify(budgetData)
  });
};

export const deleteBudget = async (budgetId) => {
  return authenticatedRequest(`/budgets/${budgetId}`, {
    method: "DELETE"
  });
};

export const updateProfile = async (profileData) => {
  return authenticatedRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(profileData)
  });
};

export const changePassword = async (passwordData) => {
  return authenticatedRequest("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(passwordData)
  });
};

export const getCashFlowAnalytics = async (year) => {
  const queryParam = year ? `?year=${year}` : "";
  return authenticatedRequest(`/analytics/cash-flow${queryParam}`);
};