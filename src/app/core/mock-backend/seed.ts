import { MockDatabase } from './mock-database';
import { User, Department, Category } from '../../models/types';
import { Priority, TicketStatus } from '../../models/enums';

const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#2563eb', '#0891b2',
  '#059669', '#d97706', '#dc2626', '#be185d',
  '#6366f1', '#8b5cf6',
];

export function seedDatabase(db: MockDatabase): void {
  const departments = seedDepartments(db);
  const users = seedUsers(db, departments);
  seedCategories(db);
  seedSettings(db);
  seedTickets(db, users);
  db.persist();
}

function seedDepartments(db: MockDatabase): Department[] {
  const depts: Department[] = [
    { id: 'dept-1', name: 'Marketing', createdAt: daysAgo(90) },
    { id: 'dept-2', name: 'Engineering', createdAt: daysAgo(90) },
    { id: 'dept-3', name: 'Human Resources', createdAt: daysAgo(90) },
  ];
  db.data.departments = depts;
  return depts;
}

function seedUsers(db: MockDatabase, departments: Department[]): User[] {
  const users: User[] = [
    {
      id: 'user-manager-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      passwordHash: 'demo123',
      role: 'MANAGER',
      departmentId: departments[1].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[0],
      createdAt: daysAgo(90),
    },
    {
      id: 'user-eng-1',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      passwordHash: 'demo123',
      role: 'ENGINEER',
      departmentId: departments[1].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[1],
      createdAt: daysAgo(85),
    },
    {
      id: 'user-eng-2',
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      passwordHash: 'demo123',
      role: 'ENGINEER',
      departmentId: departments[1].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[2],
      createdAt: daysAgo(80),
    },
    {
      id: 'user-eng-3',
      name: 'David Kim',
      email: 'david.kim@company.com',
      passwordHash: 'demo123',
      role: 'ENGINEER',
      departmentId: departments[1].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[3],
      createdAt: daysAgo(75),
    },
    {
      id: 'user-emp-1',
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[0].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[4],
      createdAt: daysAgo(60),
    },
    {
      id: 'user-emp-2',
      name: 'Bob Martinez',
      email: 'bob.martinez@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[0].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[5],
      createdAt: daysAgo(55),
    },
    {
      id: 'user-emp-3',
      name: 'Carol White',
      email: 'carol.white@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[2].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[6],
      createdAt: daysAgo(50),
    },
    {
      id: 'user-emp-4',
      name: 'Daniel Lee',
      email: 'daniel.lee@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[1].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[7],
      createdAt: daysAgo(45),
    },
    {
      id: 'user-emp-5',
      name: 'Emma Thompson',
      email: 'emma.thompson@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[2].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[8],
      createdAt: daysAgo(40),
    },
    {
      id: 'user-emp-6',
      name: 'Frank Brown',
      email: 'frank.brown@company.com',
      passwordHash: 'demo123',
      role: 'EMPLOYEE',
      departmentId: departments[0].id,
      isActive: true,
      avatarColor: AVATAR_COLORS[9],
      createdAt: daysAgo(35),
    },
  ];
  db.data.users = users;
  return users;
}

function seedCategories(db: MockDatabase): void {
  const categories: Category[] = [
    { id: 'cat-1', name: 'Computer / Laptop Issues', description: 'Hardware problems with desktops or laptops', icon: 'computer', isActive: true, sortOrder: 1 },
    { id: 'cat-2', name: 'Internet / Network Problems', description: 'Connectivity and network access issues', icon: 'wifi', isActive: true, sortOrder: 2 },
    { id: 'cat-3', name: 'Printer Issues', description: 'Printer setup, connectivity, and hardware', icon: 'print', isActive: true, sortOrder: 3 },
    { id: 'cat-4', name: 'Software Installation', description: 'Request new software or updates', icon: 'install_desktop', isActive: true, sortOrder: 4 },
    { id: 'cat-5', name: 'Software Errors', description: 'Application crashes and error messages', icon: 'bug_report', isActive: true, sortOrder: 5 },
    { id: 'cat-6', name: 'Email / Outlook Problems', description: 'Email client issues and configuration', icon: 'email', isActive: true, sortOrder: 6 },
    { id: 'cat-7', name: 'Account / Password Issues', description: 'Password resets and account lockouts', icon: 'lock', isActive: true, sortOrder: 7 },
    { id: 'cat-8', name: 'Access Permissions', description: 'File, folder, or system access requests', icon: 'admin_panel_settings', isActive: true, sortOrder: 8 },
    { id: 'cat-9', name: 'Keyboard / Mouse Issues', description: 'Input device problems', icon: 'keyboard', isActive: true, sortOrder: 9 },
    { id: 'cat-10', name: 'Monitor / Display Issues', description: 'Screen, resolution, and display problems', icon: 'desktop_windows', isActive: true, sortOrder: 10 },
    { id: 'cat-11', name: 'VPN Problems', description: 'VPN connectivity and configuration', icon: 'vpn_key', isActive: true, sortOrder: 11 },
    { id: 'cat-12', name: 'Other IT Issues', description: 'Any other IT-related problems', icon: 'help_outline', isActive: true, sortOrder: 12 },
  ];
  db.data.categories = categories;
}

function seedSettings(db: MockDatabase): void {
  db.data.settings = {
    reopenPolicy: 'RETURN_TO_ENGINEER',
    reopenWindowDays: 7,
    engineersCanSelfAssign: false,
    engineersCanViewUnassigned: true,
    slaHours: { CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 72 } as Record<Priority, number>,
  };
}

interface SeedTicketSpec {
  createdById: string;
  categoryId: string;
  title: string;
  description: string;
  priority: Priority;
  targetStatus: TicketStatus;
  assigneeId?: string;
  resolutionNote?: string;
  reopenReason?: string;
  daysAgoCreated: number;
}

function seedTickets(db: MockDatabase, users: User[]): void {
  const manager = users[0];
  const engineers = users.slice(1, 4);
  const employees = users.slice(4);

  const specs: SeedTicketSpec[] = [
    // OPEN tickets
    {
      createdById: employees[0].id, categoryId: 'cat-1', title: 'Laptop screen flickering intermittently',
      description: 'My laptop screen has been flickering every few minutes since yesterday. It happens during video calls and when switching between applications. The laptop model is Dell Latitude 5520.',
      priority: 'MEDIUM', targetStatus: 'OPEN', daysAgoCreated: 1,
    },
    {
      createdById: employees[1].id, categoryId: 'cat-6', title: 'Cannot send emails with attachments larger than 5MB',
      description: 'When I try to send emails with attachments over 5MB through Outlook, I get an error saying the message cannot be sent. This started happening after the last Outlook update.',
      priority: 'LOW', targetStatus: 'OPEN', daysAgoCreated: 2,
    },

    // ASSIGNED tickets
    {
      createdById: employees[2].id, categoryId: 'cat-2', title: 'Wi-Fi keeps disconnecting in conference room B',
      description: 'The Wi-Fi connection drops every 10-15 minutes in conference room B on the 3rd floor. This affects all devices. The issue has been happening for about a week.',
      priority: 'HIGH', targetStatus: 'ASSIGNED', assigneeId: engineers[0].id, daysAgoCreated: 3,
    },
    {
      createdById: employees[3].id, categoryId: 'cat-4', title: 'Need Adobe Acrobat Pro installed',
      description: 'I need Adobe Acrobat Pro installed on my workstation for editing and signing PDF documents. My manager has already approved the license.',
      priority: 'MEDIUM', targetStatus: 'ASSIGNED', assigneeId: engineers[1].id, daysAgoCreated: 2,
    },

    // IN_PROGRESS tickets
    {
      createdById: employees[0].id, categoryId: 'cat-7', title: 'Account locked after password change',
      description: 'I changed my password this morning and now my account is locked. I cannot log into my workstation or any company systems. This is urgent as I have a client presentation today.',
      priority: 'CRITICAL', targetStatus: 'IN_PROGRESS', assigneeId: engineers[0].id, daysAgoCreated: 1,
    },
    {
      createdById: employees[4].id, categoryId: 'cat-5', title: 'Excel crashes when opening large spreadsheets',
      description: 'Microsoft Excel crashes immediately when I try to open spreadsheets larger than 50MB. I have tried repairing Office but the issue persists. I need this for quarterly reporting.',
      priority: 'HIGH', targetStatus: 'IN_PROGRESS', assigneeId: engineers[1].id, daysAgoCreated: 4,
    },
    {
      createdById: employees[5].id, categoryId: 'cat-11', title: 'VPN connection times out from home office',
      description: 'I cannot maintain a stable VPN connection from my home office. The connection drops after about 5 minutes. I have tested with both Wi-Fi and ethernet connections.',
      priority: 'MEDIUM', targetStatus: 'IN_PROGRESS', assigneeId: engineers[2].id, daysAgoCreated: 5,
    },

    // VERIFICATION tickets
    {
      createdById: employees[1].id, categoryId: 'cat-3', title: 'Printer on 2nd floor not responding',
      description: 'The shared printer on the 2nd floor near the break room is not responding to print jobs. The display shows "Ready" but nothing prints when jobs are sent.',
      priority: 'MEDIUM', targetStatus: 'VERIFICATION', assigneeId: engineers[0].id,
      resolutionNote: 'Cleared the print queue and restarted the print spooler service. Also updated the printer firmware to the latest version. Test page printed successfully.',
      daysAgoCreated: 6,
    },
    {
      createdById: employees[2].id, categoryId: 'cat-8', title: 'Need access to Marketing shared drive',
      description: 'I recently transferred to the Marketing department and need access to the Marketing shared drive on the file server. My employee ID is E-2847.',
      priority: 'LOW', targetStatus: 'VERIFICATION', assigneeId: engineers[1].id,
      resolutionNote: 'Added user to the Marketing-Team security group in Active Directory. Access to the shared drive should now be available after logging out and back in.',
      daysAgoCreated: 7,
    },

    // CLOSED tickets
    {
      createdById: employees[3].id, categoryId: 'cat-9', title: 'Wireless mouse not connecting via Bluetooth',
      description: 'My wireless mouse stopped connecting via Bluetooth after the latest Windows update. I have tried removing and re-pairing the device but it does not appear in the Bluetooth settings.',
      priority: 'LOW', targetStatus: 'CLOSED', assigneeId: engineers[2].id,
      resolutionNote: 'Updated Bluetooth drivers and reset the Bluetooth stack. The mouse paired successfully after the driver update and is now working properly.',
      daysAgoCreated: 14,
    },
    {
      createdById: employees[0].id, categoryId: 'cat-10', title: 'External monitor not detected after docking',
      description: 'My external monitor is not detected when I connect my laptop to the docking station. The monitor works fine with a direct HDMI connection but not through the dock.',
      priority: 'MEDIUM', targetStatus: 'CLOSED', assigneeId: engineers[0].id,
      resolutionNote: 'Replaced the docking station firmware and updated the USB-C drivers on the laptop. Tested with the external monitor and it was detected immediately through the dock.',
      daysAgoCreated: 20,
    },
    {
      createdById: employees[4].id, categoryId: 'cat-7', title: 'Password reset for SAP system',
      description: 'I forgot my SAP system password and need it reset. My SAP username is ETHOMPSON.',
      priority: 'MEDIUM', targetStatus: 'CLOSED', assigneeId: engineers[1].id,
      resolutionNote: 'Reset the SAP password through the admin console and sent the temporary password via secure channel. User has confirmed they can log in and was reminded to change the password on first login.',
      daysAgoCreated: 25,
    },

    // REOPENED tickets
    {
      createdById: employees[5].id, categoryId: 'cat-2', title: 'Intermittent network drops on 4th floor',
      description: 'Several people on the 4th floor are experiencing intermittent network drops throughout the day. The issue seems to affect both wired and wireless connections.',
      priority: 'HIGH', targetStatus: 'REOPENED', assigneeId: engineers[2].id,
      resolutionNote: 'Replaced the network switch on the 4th floor and reconfigured the VLAN settings. Monitored for 2 hours and the connection was stable throughout.',
      reopenReason: 'The issue came back this morning. Multiple people are reporting drops again, happening every 20-30 minutes.',
      daysAgoCreated: 10,
    },
    {
      createdById: employees[3].id, categoryId: 'cat-5', title: 'CRM application freezing during data entry',
      description: 'The CRM application freezes for 10-15 seconds whenever I try to save a new contact record. This happens consistently and makes data entry very slow.',
      priority: 'MEDIUM', targetStatus: 'REOPENED', assigneeId: engineers[0].id,
      resolutionNote: 'Cleared the application cache and increased the allocated memory. Also optimized the database queries for the contact save operation. Testing showed immediate response times.',
      reopenReason: 'Still freezing when saving contacts. It seems worse during peak hours around 10am-12pm.',
      daysAgoCreated: 8,
    },
  ];

  for (const spec of specs) {
    createTicketThroughWorkflow(db, spec, manager, users);
  }
}

function createTicketThroughWorkflow(
  db: MockDatabase,
  spec: SeedTicketSpec,
  manager: User,
  allUsers: User[],
): void {
  const now = new Date();
  const createdDate = new Date(now.getTime() - spec.daysAgoCreated * 24 * 60 * 60 * 1000);
  const ticketNumber = db.getNextTicketNumber();
  const ticketId = `ticket-${ticketNumber}`;
  const slaHours = db.data.settings.slaHours[spec.priority];

  const ticket = {
    id: ticketId,
    number: ticketNumber,
    title: spec.title,
    description: spec.description,
    categoryId: spec.categoryId,
    priority: spec.priority,
    status: 'OPEN' as TicketStatus,
    createdById: spec.createdById,
    assigneeId: null as string | null,
    awaitingEmployeeInfo: false,
    dueAt: new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000).toISOString(),
    resolvedAt: null as string | null,
    closedAt: null as string | null,
    employeeConfirmedAt: null as string | null,
    reopenCount: 0,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
  };

  db.data.tickets.push(ticket);

  const creator = allUsers.find(u => u.id === spec.createdById)!;
  addActivity(db, ticketId, creator, 'CREATED', null, 'OPEN', createdDate);
  addNotificationsForCreate(db, ticketId, allUsers);

  if (spec.targetStatus === 'OPEN') return;

  // Assign
  if (spec.assigneeId) {
    const assignDate = new Date(createdDate.getTime() + 2 * 60 * 60 * 1000);
    ticket.assigneeId = spec.assigneeId;
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = assignDate.toISOString();
    addActivity(db, ticketId, manager, 'ASSIGNED', 'OPEN', 'ASSIGNED', assignDate, {
      assigneeId: spec.assigneeId,
      assigneeName: allUsers.find(u => u.id === spec.assigneeId)?.name ?? '',
    });
  }

  if (spec.targetStatus === 'ASSIGNED') return;

  // Start work
  const startDate = new Date(createdDate.getTime() + 4 * 60 * 60 * 1000);
  const assignee = allUsers.find(u => u.id === spec.assigneeId)!;
  ticket.status = 'IN_PROGRESS';
  ticket.updatedAt = startDate.toISOString();
  addActivity(db, ticketId, assignee, 'STARTED_WORK', 'ASSIGNED', 'IN_PROGRESS', startDate);

  if (spec.targetStatus === 'IN_PROGRESS') return;

  // Submit verification
  if (spec.resolutionNote) {
    const resolveDate = new Date(createdDate.getTime() + (spec.daysAgoCreated - 1) * 24 * 60 * 60 * 1000);
    ticket.status = 'VERIFICATION';
    ticket.resolvedAt = resolveDate.toISOString();
    ticket.updatedAt = resolveDate.toISOString();
    addActivity(db, ticketId, assignee, 'SUBMITTED_VERIFICATION', 'IN_PROGRESS', 'VERIFICATION', resolveDate);
    addComment(db, ticketId, assignee.id, 'RESOLUTION', spec.resolutionNote, resolveDate);
  }

  if (spec.targetStatus === 'VERIFICATION') return;

  // Close or reopen
  if (spec.targetStatus === 'CLOSED') {
    const closeDate = new Date(createdDate.getTime() + (spec.daysAgoCreated - 0.5) * 24 * 60 * 60 * 1000);
    ticket.status = 'CLOSED';
    ticket.closedAt = closeDate.toISOString();
    ticket.employeeConfirmedAt = closeDate.toISOString();
    ticket.updatedAt = closeDate.toISOString();
    addActivity(db, ticketId, creator, 'CONFIRMED_RESOLUTION', 'VERIFICATION', 'CLOSED', closeDate);
    return;
  }

  if (spec.targetStatus === 'REOPENED' && spec.reopenReason) {
    const reopenDate = new Date(createdDate.getTime() + (spec.daysAgoCreated - 0.5) * 24 * 60 * 60 * 1000);
    ticket.status = 'REOPENED';
    ticket.reopenCount = 1;
    ticket.resolvedAt = null;
    ticket.updatedAt = reopenDate.toISOString();

    if (db.data.settings.reopenPolicy === 'RETURN_TO_MANAGER') {
      ticket.assigneeId = null;
    }

    addActivity(db, ticketId, creator, 'REOPENED', 'VERIFICATION', 'REOPENED', reopenDate);
    addComment(db, ticketId, creator.id, 'REOPEN_REASON', spec.reopenReason, reopenDate);
  }
}

function addActivity(
  db: MockDatabase,
  ticketId: string,
  actor: User,
  action: string,
  fromStatus: TicketStatus | null,
  toStatus: TicketStatus | null,
  date: Date,
  details: Record<string, string> = {},
): void {
  db.data.activities.push({
    id: db.generateId(),
    ticketId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    fromStatus,
    toStatus,
    details,
    createdAt: date.toISOString(),
  });
}

function addComment(
  db: MockDatabase,
  ticketId: string,
  authorId: string,
  type: 'RESOLUTION' | 'REOPEN_REASON' | 'PUBLIC' | 'WORK_NOTE' | 'INFO_REQUEST',
  body: string,
  date: Date,
): void {
  db.data.comments.push({
    id: db.generateId(),
    ticketId,
    authorId,
    type,
    body,
    attachmentIds: [],
    createdAt: date.toISOString(),
  });
}

function addNotificationsForCreate(db: MockDatabase, ticketId: string, users: User[]): void {
  const ticket = db.data.tickets.find(t => t.id === ticketId)!;
  const managers = users.filter(u => u.role === 'MANAGER' && u.id !== ticket.createdById);
  for (const mgr of managers) {
    db.data.notifications.push({
      id: db.generateId(),
      userId: mgr.id,
      ticketId,
      type: 'TICKET_CREATED',
      title: 'New ticket submitted',
      body: `HD-${ticket.number}: ${ticket.title}`,
      readAt: null,
      createdAt: ticket.createdAt,
    });
  }
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
