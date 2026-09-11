import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchService, technicianService, workOrderService } from '../services/apiService';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { WorkOrder, Technician } from '../types';
import { useThemeContext } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Room as LocationIcon,
} from '@mui/icons-material';

const ItemTypes = {
  WORK_ORDER: 'work_order',
};

// --- Drag Component ---
interface DraggableOrderProps {
  order: WorkOrder;
}

const DraggableOrder: React.FC<DraggableOrderProps> = ({ order }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORK_ORDER,
    item: { id: order.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as any} style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab', marginBottom: '16px' }}>
      <Card 
        variant="outlined" 
        sx={{ 
          p: 2.5, 
          borderRadius: '16px',
          borderColor: 'rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
          {order.title}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, color: 'text.secondary' }}>
          <LocationIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {order.location}
          </Typography>
        </Stack>
        
        <Chip 
          label={order.priority} 
          size="small" 
          color={order.priority === 'CRITICAL' ? 'error' : order.priority === 'HIGH' ? 'warning' : 'primary'} 
          sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
      </Card>
    </div>
  );
};

// --- Drop Component ---
interface DroppableTechProps {
  tech: Technician;
  onAssign: (workOrderId: number, technicianId: number) => void;
  assignedOrders: WorkOrder[];
}

const DroppableTech: React.FC<DroppableTechProps> = ({ tech, onAssign, assignedOrders }) => {
  const { mode } = useThemeContext();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORK_ORDER,
    drop: (item: { id: number }) => onAssign(item.id, tech.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Box
      ref={drop as any}
      sx={{
        p: 3,
        borderRadius: '24px',
        border: '2px dashed',
        borderColor: isOver ? 'primary.main' : mode === 'light' ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)',
        bgcolor: isOver 
          ? (mode === 'light' ? 'rgba(37,99,235,0.05)' : 'rgba(56,189,248,0.05)') 
          : (mode === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.3)'),
        backdropFilter: 'blur(10px)',
        minHeight: 220,
        transition: 'all 0.2s ease',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {tech.name}
        </Typography>
        <Chip 
          label={tech.status} 
          size="small" 
          color={tech.status === 'AVAILABLE' ? 'success' : 'default'} 
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        />
      </Stack>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
        Expertise: {tech.skills || 'General Support'}
      </Typography>
      
      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      {assignedOrders.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, opacity: 0.5 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Drag tickets here to schedule
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {assignedOrders.map((o) => (
            <DraggableOrder key={o.id} order={o} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

// --- Main Content Component ---
const DispatchCenterContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { mode } = useThemeContext();

  // Load Technicians
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: technicianService.getAll,
  });

  // Load Scheduled and Unscheduled Work Orders
  const { data: workOrders } = useQuery({
    queryKey: ['dispatchCalendar'],
    queryFn: () => dispatchService.getCalendar(),
  });

  const mutateAssign = useMutation({
    mutationFn: (payload: { workOrderId: number; technicianId: number }) =>
      dispatchService.assign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatchCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const mutateUnassign = useMutation({
    mutationFn: (workOrderId: number) => workOrderService.reject(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatchCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const handleAssign = (workOrderId: number, technicianId: number) => {
    mutateAssign.mutate({ workOrderId, technicianId });
  };

  const handleUnassign = (workOrderId: number) => {
    mutateUnassign.mutate(workOrderId);
  };

  const [{ isOverPool }, dropPool] = useDrop(() => ({
    accept: ItemTypes.WORK_ORDER,
    drop: (item: { id: number }) => handleUnassign(item.id),
    collect: (monitor) => ({
      isOverPool: !!monitor.isOver(),
    }),
  }));

  const unassigned = workOrders?.filter((wo) => !wo.assignedTechnician) || [];

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Unassigned side panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            ref={dropPool as any}
            sx={{ 
              height: '100%', 
              p: 1,
              border: '2px dashed',
              borderColor: isOverPool ? 'primary.main' : 'transparent',
              bgcolor: isOverPool 
                ? (mode === 'light' ? 'rgba(37,99,235,0.05)' : 'rgba(56,189,248,0.05)') 
                : 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Unscheduled Pool
                <Chip 
                  label={unassigned.length} 
                  size="small" 
                  color="primary" 
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {unassigned.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: '12px' }}>
                  All active tickets are fully dispatched!
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', pr: 0.5 }}>
                  {unassigned.map((wo) => (
                    <DraggableOrder key={wo.id} order={wo} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Technicians grid panel */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                Active Dispatch Lanes
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', pr: 0.5 }}>
                <Grid container spacing={3}>
                  {technicians?.map((tech) => {
                    const assigned = workOrders?.filter((wo) => wo.assignedTechnician?.id === tech.id) || [];
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={tech.id}>
                        <DroppableTech
                          tech={tech}
                          onAssign={handleAssign}
                          assignedOrders={assigned}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- Main Page Wrapper ---
export const DispatchPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DispatchCenterContent />
    </DndProvider>
  );
};

export default DispatchPage;
