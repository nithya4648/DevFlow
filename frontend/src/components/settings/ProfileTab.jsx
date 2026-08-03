import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { userService } from "../../services/user.service";
import { User, Upload, Loader } from "lucide-react";

const ProfileTab = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const data = await userService.updateProfile(formData);
      setUser(data.user);
      addToast("Profile updated successfully", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl font-ui">
      <div>
        <h2 className="text-base font-bold text-gh-heading font-mono">Profile Information</h2>
        <p className="mt-0.5 text-xs text-gh-muted font-mono">
          Update your account's profile information and avatar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="shrink-0 relative group">
            {avatarPreview ? (
              <img
                className="h-20 w-20 object-cover rounded-full border border-gh-border"
                src={avatarPreview}
                alt="Avatar preview"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gh-subtle flex items-center justify-center border border-gh-border">
                <User className="h-8 w-8 text-gh-muted" />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
              <Upload className="h-5 w-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <label className="block text-xs font-mono font-medium text-gh-heading">
              Avatar
            </label>
            <p className="text-xs text-gh-muted font-mono mt-0.5 mb-2">
              Click to upload a new avatar. JPG, GIF or PNG. Max size 5MB.
            </p>
            {avatar && (
              <button
                type="button"
                onClick={() => {
                  setAvatar(null);
                  setAvatarPreview(user?.avatar || "");
                }}
                className="text-xs font-mono text-red-400 hover:text-red-300"
              >
                Remove selected image
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-xs font-mono font-medium text-gh-muted mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="gh-input text-xs font-mono w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="gh-input text-xs font-mono w-full bg-gh-bg cursor-not-allowed opacity-70"
          />
          <p className="mt-1 text-[11px] text-gh-muted font-mono">
            Email address cannot be changed.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary text-xs font-mono"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
