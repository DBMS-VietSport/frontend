'use client';

import { useState, useEffect } from 'react';
import { ShiftFilterBar } from '@/features/shifts/components/ShiftFilterBar';
import { ShiftTimetable } from '@/features/shifts/components/ShiftTimetable';
import { ShiftCellAssignDialog } from '@/features/shifts/components/ShiftCellAssignDialog';
import { ShiftLegend } from '@/features/shifts/components/ShiftLegend';
import {
  ShiftFilters,
  ShiftCellData,
  WorkShift,
  Employee,
  RoleRequirement,
} from '@/features/shifts/types';
import {
  getCurrentWeekInfo,
  getWeekData,
  getWeekdayLabel,
  formatTime,
} from '@/features/shifts/utils';
import {
  listWorkShiftsByDateRange,
  listAssignmentsByWorkShiftIds,
  getEmployee,
  listRoles,
  getShiftRoleRequirements,
} from '@/features/shifts';

export default function ShiftAssignPage() {
  const [filters, setFilters] = useState<ShiftFilters>(getCurrentWeekInfo());
  const [shiftsData, setShiftsData] = useState<ShiftCellData[]>([]);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<ShiftCellData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Load shifts data whenever filters change
  useEffect(() => {
    loadShiftsData();
  }, [filters]);
  
  const loadShiftsData = () => {
    const weekData = getWeekData(filters.year, filters.month, filters.week);
    if (!weekData) return;
    
    setWeekDays(weekData.days);
    
    // Fetch work shifts for the week
    const workShifts = listWorkShiftsByDateRange(weekData.startDate, weekData.endDate);
    
    // Get all assignments for these shifts
    const shiftIds = workShifts.map(s => s.id);
    const assignments = listAssignmentsByWorkShiftIds(shiftIds);
    
    // Get all roles
    const roles = listRoles();
    
    // Transform to ShiftCellData
    const cellsData: ShiftCellData[] = workShifts.map((shift) => {
      const shiftAssignments = assignments.filter(a => a.work_shift_id === shift.id);
      const roleRequirements = getShiftRoleRequirements(shift);
      
      // Build role requirements with assigned employees
      const required_per_role: RoleRequirement[] = roleRequirements.map((req) => {
        const assignedEmployees: Employee[] = [];
        
        shiftAssignments.forEach((assignment) => {
          const employee = getEmployee(assignment.employee_id);
          if (employee && employee.role_id === req.role_id) {
            assignedEmployees.push(employee);
          }
        });
        
        const role = roles.find(r => r.id === req.role_id);
        
        return {
          role_id: req.role_id,
          role_name: role?.name || `Role ${req.role_id}`,
          required: req.required,
          assigned: assignedEmployees.length,
          employees: assignedEmployees,
        };
      });
      
      return {
        id: shift.id,
        date: shift.date,
        weekdayLabel: getWeekdayLabel(shift.date),
        timeRange: `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`,
        required_per_role,
      };
    });
    
    setShiftsData(cellsData);
  };
  
  const handleCellClick = (shift: ShiftCellData) => {
    setSelectedShift(shift);
    setDialogOpen(true);
  };
  
  const handleDialogUpdate = () => {
    // Reload shifts data to reflect changes
    loadShiftsData();
  };
  
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phân ca làm việc</h1>
        <p className="text-gray-500 mt-1">
          Quản lý và phân công nhân viên vào các ca làm việc
        </p>
      </div>
      
      {/* Filters */}
      <ShiftFilterBar filters={filters} onFiltersChange={setFilters} />
      
      {/* Legend */}
      <ShiftLegend />
      
      {/* Timetable */}
      <ShiftTimetable
        weekDays={weekDays}
        shiftsData={shiftsData}
        onCellClick={handleCellClick}
      />
      
      {/* Assignment Dialog */}
      <ShiftCellAssignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shiftData={selectedShift}
        onUpdate={handleDialogUpdate}
      />
    </div>
  );
}
