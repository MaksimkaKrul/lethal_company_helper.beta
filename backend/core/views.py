from django.shortcuts import render

def home(request):
    return render(request, "home.html")

def frontend(request):
    return render(request, "index.html")