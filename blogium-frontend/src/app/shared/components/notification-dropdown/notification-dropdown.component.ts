import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../models/notification.model';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: []
})
export class NotificationDropdownComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  dropdownOpen = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe((response: any) => {
      // Backend returns { notifications: [], unreadCount: number }
      if (response && Array.isArray(response.notifications)) {
        this.notifications = response.notifications;
        this.unreadCount = response.unreadCount || 0;
      } else {
        // Fallback for empty response
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.unreadCount = this.notifications.filter((n: Notification) => !n.isRead).length;
      });
    }
  }
}
