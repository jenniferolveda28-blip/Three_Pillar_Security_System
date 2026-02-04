import { base44 } from "@/api/base44Client";

export async function logActivity({ action_type, entity_type, entity_id, description, details, status = 'success' }) {
  try {
    const user = await base44.auth.me();
    
    await base44.entities.ActivityLog.create({
      user_email: user?.email || 'anonymous',
      action_type,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      description,
      details: details || {},
      status,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}