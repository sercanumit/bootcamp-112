from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Sınav öğrencileri için custom user model
    """
    DEPARTMENT_CHOICES = [
        ('sayisal', 'Sayısal'),
        ('sozel', 'Sözel'),
        ('ea', 'Eşit Ağırlık'),
        ('dil', 'Dil'),
        ('msu', 'MSÜ Odaklı'),
    ]
    
    GENDER_CHOICES = [
        ('erkek', 'Erkek'),
        ('kadin', 'Kadın'),
        ('diger', 'Diğer'),
    ]
    
    firebase_uid=models.CharField(max_length=255,unique=True,null=True,blank=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    hedef_meslek = models.CharField(max_length=100, blank=True, null=True)
    bolum = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='sayisal')
    yas = models.PositiveIntegerField(blank=True, null=True, verbose_name='Yaş')
    cinsiyet = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True, verbose_name='Cinsiyet')
    dogum_tarihi = models.DateField(blank=True, null=True, verbose_name='Doğum Tarihi')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'  # Email ile login
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
