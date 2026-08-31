function estimateTeacherProRevenue({ totalUsers = 0, teacherProUsers = 0, monthlyPrice = 10, annualPrice = 110 } = {}) {
  const safeTotal = Number.isFinite(totalUsers) ? Math.max(0, totalUsers) : 0;
  const safeTeacherProUsers = Number.isFinite(teacherProUsers) ? Math.max(0, teacherProUsers) : 0;
  const monthly = Number.isFinite(monthlyPrice) ? Math.max(0, monthlyPrice) : 0;
  const annual = Number.isFinite(annualPrice) ? Math.max(0, annualPrice) : 0;

  const monthlyRevenue = safeTeacherProUsers * monthly;
  const annualizedRevenue = safeTeacherProUsers * annual;
  const monthlyConversionRate = safeTotal ? Math.round((safeTeacherProUsers / safeTotal) * 100) : 0;

  return {
    totalUsers: safeTotal,
    teacherProUsers: safeTeacherProUsers,
    monthlyPrice: monthly,
    annualPrice: annual,
    monthlyRevenue,
    annualizedRevenue,
    monthlyConversionRate,
  };
}

function buildCreatorMonetisationSnapshot(users = [], now = new Date()) {
  const normalized = Array.isArray(users) ? users : [];
  const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;
  const recentCutoff = now.getTime() - thirtyDaysMs;

  const recentSignups = normalized.filter((user) => {
    const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && createdAt >= recentCutoff;
  }).length;

  const recentProUsers = normalized.filter((user) => {
    if (!user?.teacherPro) return false;
    const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && createdAt >= recentCutoff;
  }).length;

  const activePremiumUsers = normalized.filter((user) => user?.teacherPro && user?.isActive).length;
  const premiumUsers = normalized.filter((user) => user?.teacherPro).length;
  const activePremiumRetention = premiumUsers ? Math.round((activePremiumUsers / premiumUsers) * 100) : 0;
  const monthlyRevenue = recentProUsers * 10;

  return {
    recentSignups,
    recentProUsers,
    activePremiumRetention,
    monthlyRevenue,
  };
}

function buildCreatorRevenueTrend(users = [], now = new Date()) {
  const normalized = Array.isArray(users) ? users : [];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = [];
  const current = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(current.getFullYear(), current.getMonth() - offset, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getTime();
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).getTime();

    const revenue = normalized
      .filter((user) => user?.teacherPro)
      .filter((user) => {
        const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
        return Number.isFinite(createdAt) && createdAt >= monthStart && createdAt < monthEnd;
      }).length * 10;

    months.push({
      label: labels[monthDate.getMonth()],
      revenue,
      signups: normalized.filter((user) => {
        const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
        return Number.isFinite(createdAt) && createdAt >= monthStart && createdAt < monthEnd;
      }).length,
    });
  }

  return {
    months,
    totalRevenue: months.reduce((sum, month) => sum + month.revenue, 0),
  };
}

function buildCreatorConversionFunnel(users = []) {
  const normalized = Array.isArray(users) ? users : [];
  const totalUsers = normalized.length;
  const teacherProUsers = normalized.filter((user) => user?.teacherPro).length;
  const teacherUsers = normalized.filter((user) => user?.role === 'teacher');
  const studentUsers = normalized.filter((user) => user?.role === 'student');
  const teacherProTeachers = teacherUsers.filter((user) => user?.teacherPro).length;
  const teacherProStudents = studentUsers.filter((user) => user?.teacherPro).length;

  const teacherConversionRate = teacherUsers.length ? Math.round((teacherProTeachers / teacherUsers.length) * 100) : 0;
  const studentConversionRate = studentUsers.length ? Math.round((teacherProStudents / studentUsers.length) * 100) : 0;
  const bestRole = teacherConversionRate >= studentConversionRate ? 'teacher' : 'student';

  return {
    totalUsers,
    teacherProUsers,
    teacherUsers: teacherUsers.length,
    studentUsers: studentUsers.length,
    teacherProTeachers,
    teacherProStudents,
    teacherConversionRate,
    studentConversionRate,
    bestRole,
  };
}

function buildCreatorCohortSummary(users = [], now = new Date()) {
  const normalized = Array.isArray(users) ? users : [];
  const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;
  const cutoff = now.getTime() - thirtyDaysMs;

  const newUsers = normalized.filter((user) => {
    const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && createdAt >= cutoff;
  });

  const returningUsers = normalized.filter((user) => {
    const createdAt = user?.createdAt instanceof Date ? user.createdAt.getTime() : new Date(user?.createdAt || 0).getTime();
    const lastLogin = user?.lastLogin instanceof Date ? user.lastLogin.getTime() : new Date(user?.lastLogin || 0).getTime();
    const signedUpBeforeWindow = Number.isFinite(createdAt) && createdAt < cutoff;
    const loggedInRecently = Number.isFinite(lastLogin) && lastLogin >= cutoff;
    return signedUpBeforeWindow && loggedInRecently;
  });

  const newUserConversionRate = newUsers.length ? Math.round((newUsers.filter((user) => user?.teacherPro).length / newUsers.length) * 100) : 0;
  const returningUserConversionRate = returningUsers.length ? Math.round((returningUsers.filter((user) => user?.teacherPro).length / returningUsers.length) * 100) : 0;
  const bestCohort = newUserConversionRate >= returningUserConversionRate ? 'new' : 'returning';

  return {
    newUsers: newUsers.length,
    returningUsers: returningUsers.length,
    newUserConversionRate,
    returningUserConversionRate,
    bestCohort,
  };
}

module.exports = { estimateTeacherProRevenue, buildCreatorMonetisationSnapshot, buildCreatorRevenueTrend, buildCreatorConversionFunnel, buildCreatorCohortSummary };
