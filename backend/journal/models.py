from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Entry(models.Model):
    """
    Daily Gratitude Journal Entry Model.
    Each user writes one daily gratitude reflection per date.
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gratitude_entries',
        db_index=True
    )
    date = models.DateField(default=timezone.now, db_index=True)
    content = models.TextField(help_text="One paragraph daily gratitude reflection")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'journal_entries'
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'date'],
                name='unique_owner_daily_entry'
            )
        ]

    def __str__(self):
        return f"{self.owner.username}'s Gratitude Entry on {self.date}"
