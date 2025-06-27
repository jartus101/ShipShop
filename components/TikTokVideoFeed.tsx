"use client";
import { DetailedPost } from '@/types/video';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import MediaPlayer from './MediaPlayer';
import VideoInfo from './VideoInfo';
import { IoHeart } from "react-icons/io5";
import { AiFillMessage } from "react-icons/ai";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { GoogleLogin } from "@react-oauth/google";
import { auth } from "@/services/auth";
import useAuth from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbLogout } from "react-icons/tb";
import { likeOrDislikeVideo, getVideoLikesInfo, getMultipleVideoLikesInfo } from "@/services/like";
import { searchVideos, getLikedVideos } from "@/services/video";
import { getPersonalizedFeed } from "@/services/algorithm";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearch, IoClose } from "react-icons/io5";

type Props = {
  posts: DetailedPost[];
  onPostDeleted?: (postId: string) => void;
};

type TabType = 'forYou' | 'likes' | 'create';

export default function TikTokVideoFeed({ posts, onPostDeleted }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('forYou');
  const [likedPosts, setLikedPosts] = useState<DetailedPost[]>([]);
  const [personalizedPosts, setPersonalizedPosts] = useState<DetailedPost[]>([]);
  const [displayPersonalizedPosts, setDisplayPersonalizedPosts] = useState<DetailedPost[]>([]); // Stable display feed
  const [hasPersonalizedFeed, setHasPersonalizedFeed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DetailedPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likesInfo, setLikesInfo] = useState<Record<string, { count: number; hasLiked: boolean }>>({});
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const [hasAttemptedLikesLoad, setHasAttemptedLikesLoad] = useState(false);
  const [pendingReorder, setPendingReorder] = useState(false); // Track if reorder is pending
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth state
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const logout = useAuth((state) => state.logout);
  const authedUser = useAuth((state) => state.user);
  const setAuth = useAuth((state) => state.setAuth);
  const { toast } = useToast();

  const onLoginSuccess = async (res: { credential?: string }) => {
    if (!res.credential) return;
    const user = await auth(res.credential);
    if (!user) return;
    setAuth(user);
    toast({ title: `Logged in as ${user.email}` });
  };

  const handleCreateClick = () => {
    router.push('/create');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setCurrentIndex(0);
      return;
    }

    setIsSearching(true);
    console.log('Starting client-side search for:', query);
    
    // Filter directly from the posts prop for instant results
    const filtered = posts.filter(post => {
      if (!post) return false;
      
      const caption = post.caption || '';
      const description = post.description || '';
      
      return caption.toLowerCase().includes(query.toLowerCase()) || 
             description.toLowerCase().includes(query.toLowerCase());
    });
    
    console.log('Search completed, results:', filtered.length);
    
    setSearchResults(filtered);
    setCurrentIndex(0);
    setIsSearching(false);
    
    toast({
      title: `Found ${filtered.length} result${filtered.length === 1 ? '' : 's'}`,
      description: filtered.length === 0 ? 'Try a different search term' : undefined
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setCurrentIndex(0);
  };

  const generatePersonalizedFeed = async (isBackgroundUpdate = false) => {
    if (!isLoggedIn || likedPosts.length === 0) {
      // No personalization possible, use original posts
      const newFeed = posts;
      setPersonalizedPosts(newFeed);
      if (!isBackgroundUpdate) {
        setDisplayPersonalizedPosts(newFeed);
      }
      setHasPersonalizedFeed(false);
      return;
    }

    try {
      console.log('Generating personalized feed based on', likedPosts.length, 'liked posts', isBackgroundUpdate ? '(background)' : '(foreground)');
      const personalizedOrder = await getPersonalizedFeed(posts, likedPosts);
      setPersonalizedPosts(personalizedOrder);
      
      if (!isBackgroundUpdate) {
        // Immediate update for initial load
        setDisplayPersonalizedPosts(personalizedOrder);
        setHasPersonalizedFeed(true);
        console.log('Personalized feed generated with', personalizedOrder.length, 'posts');
        
        toast({
          title: "Feed personalized!",
          description: `Based on your ${likedPosts.length} liked posts`
        });
      } else {
        // Background update - mark for later application
        setPendingReorder(true);
        console.log('Background personalized feed generated, pending reorder');
      }
      
    } catch (error) {
      console.error('Error generating personalized feed:', error);
      // Fallback to original posts
      const fallbackFeed = posts;
      setPersonalizedPosts(fallbackFeed);
      if (!isBackgroundUpdate) {
        setDisplayPersonalizedPosts(fallbackFeed);
        setHasPersonalizedFeed(false);
      }
    }
  };

  const handleTabChange = async (tab: TabType) => {
    if (tab === 'create') {
      handleCreateClick();
      return;
    }
    
    if (tab === 'likes' && !isLoggedIn) {
      toast({ 
        title: "Please sign in to view your saved products",
        variant: "destructive" 
      });
      return; // Don't change the tab if not logged in
    }

    // Clear search when switching tabs
    if (tab !== 'forYou') {
      clearSearch();
    }
    
    // Always switch to the tab first, regardless of loading state
    setActiveTab(tab);
    setCurrentIndex(0);
    
    // Generate personalized feed when switching to "For You" tab
    if (tab === 'forYou' && isLoggedIn) {
      await generatePersonalizedFeed();
    }
    
    // Only try to fetch liked posts if we're switching to likes tab and don't have them yet
    if (tab === 'likes' && !isLoadingLikes) {
      setIsLoadingLikes(true);
      setHasAttemptedLikesLoad(true);
      try {
        console.log('Loading liked posts...');
        const videos = await getLikedVideos();
        console.log('Received liked videos:', videos.length);
        const posts = videos.map(video => {
          // Determine media type based on URL extension
          const url = video.video_url || '';
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
          
          return {
            ...video,
            media_url: video.video_url,
            media_type: isImage ? 'image' as const : 'video' as const
          };
        });
        setLikedPosts(posts);
        
        // Initialize like state for all liked posts
        const likesInfoUpdate: Record<string, { count: number; hasLiked: boolean }> = {};
        posts.forEach(post => {
          likesInfoUpdate[post._id] = {
            count: post.likes_count,
            hasLiked: true // These posts are from the liked videos, so they should be marked as liked
          };
        });
        setLikesInfo(prev => ({ ...prev, ...likesInfoUpdate }));
      } catch (error) {
        console.error('Error fetching liked posts:', error);
        toast({ 
          title: "Failed to load liked posts",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive" 
        });
        // Don't switch back to forYou - stay on likes tab and show empty state
      } finally {
        setIsLoadingLikes(false);
      }
    }
  };

  const handleLikeClick = async () => {
    if (!isLoggedIn || !authedUser) {
      toast({ 
        title: "Please sign in to save products",
        variant: "destructive" 
      });
      return;
    }

    const currentPost = getCurrentPosts()[currentIndex];
    if (!currentPost) return;

    const currentLikeInfo = likesInfo[currentPost._id] || { count: currentPost.likes_count, hasLiked: false };
    const wasLiked = currentLikeInfo.hasLiked; // Capture original state before optimistic update
    
    // Optimistically update the UI first for immediate feedback
    const newHasLiked = !currentLikeInfo.hasLiked;
    const newCount = newHasLiked ? currentLikeInfo.count + 1 : currentLikeInfo.count - 1;
    
    setLikesInfo(prev => ({
      ...prev,
      [currentPost._id]: {
        count: newCount,
        hasLiked: newHasLiked
      }
    }));

    // If we're unliking any post (regardless of which tab we're on), remove it from the liked posts array
    if (wasLiked) {
      setLikedPosts(prev => prev.filter(post => post._id !== currentPost._id));
    }

    try {
      const result = await likeOrDislikeVideo(currentPost._id, wasLiked);

      // Update with the actual count from the server
      if (result && typeof result.count === 'number') {
        setLikesInfo(prev => ({
          ...prev,
          [currentPost._id]: {
            count: result.count,
            hasLiked: result.hasLiked
          }
        }));

        // If we just liked a post and we're not on the likes tab, add it to liked posts
        if (result.hasLiked && activeTab !== 'likes') {
          const postWithAdaptedFields = {
            ...currentPost,
            media_url: currentPost.media_url,
            media_type: currentPost.media_type
          };
          setLikedPosts(prev => {
            // Only add if not already in the list
            if (!prev.find(post => post._id === currentPost._id)) {
              return [postWithAdaptedFields, ...prev];
            }
            return prev;
          });
        }
      }
      
      // Trigger background feed reordering after successful like/unlike
      if (activeTab === 'forYou' && isLoggedIn) {
        setTimeout(() => generatePersonalizedFeed(true), 100); // Small delay to ensure state updates complete
      }
      
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert the optimistic update on error
      setLikesInfo(prev => ({
        ...prev,
        [currentPost._id]: currentLikeInfo
      }));

      // If we optimistically removed from liked posts, add it back on error
      if (wasLiked) {
        const postWithAdaptedFields = {
          ...currentPost,
          media_url: currentPost.media_url,
          media_type: currentPost.media_type
        };
        setLikedPosts(prev => {
          // Only add back if not already in the list
          if (!prev.find(post => post._id === currentPost._id)) {
            return [postWithAdaptedFields, ...prev];
          }
          return prev;
        });
      }
      
      toast({ 
        title: "Failed to update like",
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const getCurrentPosts = () => {
    if (activeTab === 'likes') {
      return likedPosts;
    } else if (activeTab === 'forYou' && searchQuery.trim()) {
      return searchResults;
    } else if (activeTab === 'forYou' && hasPersonalizedFeed) {
      return displayPersonalizedPosts; // Use stable display feed
    } else {
      return posts;
    }
  };

  // Apply pending reorder when user navigates or after a delay
  const applyPendingReorder = useCallback(() => {
    if (pendingReorder && activeTab === 'forYou' && !searchQuery.trim()) {
      console.log('Applying pending reorder');
      
      // Only reorder posts that come after the current position
      const currentPost = displayPersonalizedPosts[currentIndex];
      if (!currentPost) {
        // If no current post, apply full reorder
        setDisplayPersonalizedPosts(personalizedPosts);
        setHasPersonalizedFeed(true);
      } else {
        // Keep posts up to current position, reorder the rest
        const currentPostInNewOrder = personalizedPosts.findIndex(p => p._id === currentPost._id);
        if (currentPostInNewOrder !== -1) {
          // Take posts from new order starting from current position
          const reorderedFeed = [
            ...displayPersonalizedPosts.slice(0, currentIndex + 1), // Keep viewed posts
            ...personalizedPosts.slice(currentPostInNewOrder + 1) // Reordered upcoming posts
          ];
          setDisplayPersonalizedPosts(reorderedFeed);
          setHasPersonalizedFeed(true);
        } else {
          // Fallback: apply full reorder
          setDisplayPersonalizedPosts(personalizedPosts);
          setHasPersonalizedFeed(true);
        }
      }
      
      setPendingReorder(false);
    }
  }, [pendingReorder, activeTab, searchQuery, displayPersonalizedPosts, currentIndex, personalizedPosts]);

  // Auto-apply pending reorders after a delay
  useEffect(() => {
    if (pendingReorder) {
      const timer = setTimeout(() => {
        console.log('Auto-applying pending reorder after delay');
        applyPendingReorder();
      }, 5000); // Apply after 5 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [pendingReorder]);

  // Initialize personalized feed when component mounts or liked posts change
  useEffect(() => {
    if (isLoggedIn && likedPosts.length > 0 && activeTab === 'forYou') {
      generatePersonalizedFeed();
    }
  }, [isLoggedIn, likedPosts.length]);

  // Load liked posts on initial mount if logged in
  useEffect(() => {
    if (isLoggedIn && !hasAttemptedLikesLoad) {
      handleTabChange('likes').then(() => {
        // Switch back to forYou after loading likes to trigger personalization
        setActiveTab('forYou');
        setCurrentIndex(0);
      });
    }
  }, [isLoggedIn]);

  // Update display feed when base posts change
  useEffect(() => {
    if (!hasPersonalizedFeed) {
      setDisplayPersonalizedPosts(posts);
    }
  }, [posts, hasPersonalizedFeed]);

  // Load like status for all posts when component mounts
  useEffect(() => {
    const loadLikeStatus = async () => {
      if (posts.length === 0) return;
      
      try {
        console.log('Loading like status for', posts.length, 'posts...');
        const videoIds = posts.map(post => post._id);
        const likesInfo = await getMultipleVideoLikesInfo(videoIds);
        
        console.log('Loaded like status:', Object.keys(likesInfo).length, 'posts');
        console.log('Sample like statuses:', Object.entries(likesInfo).slice(0, 3));
        setLikesInfo(prev => ({
          ...prev,
          ...likesInfo
        }));
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    };

    loadLikeStatus();
  }, [posts.length, isLoggedIn]); // Re-run when posts change or login status changes

  const handleDeletePost = async () => {
    if (!currentPost || !authedUser) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/posts/${currentPost._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      toast({ title: "Post deleted successfully" });
      setShowDeleteMenu(false);
      
      // Call the callback to update the posts list
      if (onPostDeleted) {
        onPostDeleted(currentPost._id);
      }
      
      // The useEffect will handle adjusting currentIndex when posts array changes
      // No redirect needed - stay in TikTok mode and show empty state if no posts remain
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ 
        title: "Failed to delete post", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const goToNext = useCallback(() => {
    // Apply pending reorder before navigation
    applyPendingReorder();
    
    const currentPosts = getCurrentPosts();
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex < currentPosts.length - 1 ? prevIndex + 1 : prevIndex;
      return newIndex;
    });
  }, [applyPendingReorder, activeTab, posts.length, likedPosts.length, searchResults.length, displayPersonalizedPosts.length, hasPersonalizedFeed]);

  const goToPrevious = useCallback(() => {
    // Apply pending reorder before navigation  
    applyPendingReorder();
    
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
      return newIndex;
    });
  }, [applyPendingReorder]);

  // Load like information for current post
  useEffect(() => {
    const loadLikeInfo = async () => {
      const currentPosts = getCurrentPosts();
      if (currentPosts.length === 0) return;
      
      const currentPost = currentPosts[currentIndex];
      if (!currentPost || likesInfo[currentPost._id]) return;
      
      try {
        const info = await getVideoLikesInfo(currentPost._id);
        setLikesInfo(prev => ({
          ...prev,
          [currentPost._id]: {
            count: info?.count || currentPost.likes_count,
            hasLiked: info?.hasLiked || false
          }
        }));
      } catch (error) {
        console.error('Error loading like info:', error);
      }
    };

    loadLikeInfo();
  }, [currentIndex, activeTab, posts, likedPosts, likesInfo]);

  // Adjust current index when posts array changes (e.g., after deletion or unliking)
  useEffect(() => {
    const currentPosts = getCurrentPosts();
    
    // If no posts remain, reset index to 0 to show empty state properly
    if (currentPosts.length === 0) {
      setCurrentIndex(0);
    } 
    // If current index is beyond array bounds, adjust it
    else if (currentIndex >= currentPosts.length) {
      setCurrentIndex(currentPosts.length - 1);
    }
  }, [activeTab, posts.length, likedPosts.length, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          event.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swipe up - go to next video
        goToNext();
      } else {
        // Swipe down - go to previous video
        goToPrevious();
      }
    }

    // Reset touch positions
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDeleteMenu) {
        setShowDeleteMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDeleteMenu]);

  // Handle URL parameters on component mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'likes' && isLoggedIn) {
      handleTabChange('likes');
    }
  }, [searchParams, isLoggedIn]);

  if (getCurrentPosts().length === 0 || (activeTab === 'likes' && isLoadingLikes)) {
    const isLikesTab = activeTab === 'likes';
    const isLoading = isLoadingLikes;
    
    // Determine the empty state based on context
    let emptyTitle: string;
    let emptyMessage: string;
    let emptyIcon: string;
    
    if (isLoading) {
      emptyTitle = "Loading liked posts...";
      emptyMessage = "Please wait while we fetch your liked posts.";
      emptyIcon = "⏳";
    } else if (isLikesTab) {
      // Show appropriate message for empty likes tab
      if (hasAttemptedLikesLoad) {
        emptyTitle = "No saved products yet";
        emptyMessage = "Products you like will appear here. Start exploring and save some amazing finds!";
      } else {
        emptyTitle = "Loading your saved products...";
        emptyMessage = "We'll show your liked products here once they're loaded.";
      }
      emptyIcon = "💔";
    } else if (searchQuery.trim() && searchResults.length === 0 && !isSearching) {
      emptyTitle = "No products found";
      emptyMessage = `No products match "${searchQuery}". Try a different search term.`;
      emptyIcon = "🔍";
    } else {
      emptyTitle = "No products yet";
      emptyMessage = "Be the first to share an amazing product! ";
      emptyIcon = "🛍️";
    }
      
    return (
      <div className="relative h-screen overflow-hidden bg-black">
        {/* Tab switcher at the top */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-black/70 backdrop-blur-sm rounded-full p-1">
          <button 
            onClick={() => handleTabChange('forYou')}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors relative ${
              activeTab === 'forYou' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            Discover
            {hasPersonalizedFeed && activeTab === 'forYou' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={() => handleTabChange('likes')}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
              activeTab === 'likes' 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            Saved
          </button>
          <button 
            onClick={() => handleTabChange('create')}
            className="px-6 py-2 rounded-full text-white font-medium text-sm hover:bg-white/20 transition-colors"
          >
            Share
          </button>
        </div>

        {/* Search bar - only visible on Discover tab */}
        {activeTab === 'forYou' && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-10 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
              />
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <IoClose className="text-lg" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-center text-white/70 text-sm">
                {isSearching ? 'Searching...' : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} found`}
              </div>
            )}
          </div>
        )}

        {/* Empty state content - centered */}
        <div className="flex flex-col items-center justify-center h-full text-white px-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">{emptyIcon}</div>
            <h2 className="text-2xl font-bold mb-4">{emptyTitle}</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {emptyMessage}
              {!isLikesTab && !isLoggedIn && " Sign in and share your first product to get started."}
              {!isLikesTab && isLoggedIn && " Share your first product discovery to get started."}
            </p>
            
            {!isLikesTab && isLoggedIn ? (
              <button
                onClick={handleCreateClick}
                className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Share your first product
              </button>
            ) : !isLikesTab && !isLoggedIn ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4">Sign in to share products</div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={onLoginSuccess}
                    onError={() => toast({ title: "Login failed", variant: "destructive" })}
                    size="large"
                  />
                </div>
              </div>
            ) : isLikesTab && !isLoading ? (
              <div className="space-y-4">
                <button
                  onClick={() => handleTabChange('forYou')}
                  className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  Discover products
                </button>
                <p className="text-sm text-gray-400">
                  Find products you love and tap the ❤️ to save them here
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const currentPosts = getCurrentPosts();
  const currentPost = currentPosts[currentIndex];
  
  if (!currentPost) {
    return (
      <div className="relative h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  const isCurrentUserPost = authedUser && currentPost && 
    (currentPost.author._id === authedUser._id || (currentPost.author as any)._ref === authedUser._id);

  return (
    <div 
      className="relative h-screen overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab switcher at the top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-black/70 backdrop-blur-sm rounded-full p-1">
        <button 
          onClick={() => handleTabChange('forYou')}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'forYou' 
              ? 'bg-white text-black' 
              : 'text-white hover:bg-white/20'
          }`}
        >
          Discover
        </button>
        <button 
          onClick={() => handleTabChange('likes')}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'likes' 
              ? 'bg-white text-black' 
              : 'text-white hover:bg-white/20'
          }`}
        >
          Saved
        </button>
        <button 
          onClick={() => handleTabChange('create')}
          className="px-6 py-2 rounded-full text-white font-medium text-sm hover:bg-white/20 transition-colors"
        >
          Share
        </button>
      </div>

      {/* Search bar - only visible on Discover tab */}
      {activeTab === 'forYou' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-10 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
            />
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-lg" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-center text-white/70 text-sm">
              {isSearching ? 'Searching...' : `${searchResults.length} results found`}
            </div>
          )}
        </div>
      )}

      {/* Full-screen video player */}
      <div className="w-full h-full flex items-center justify-center relative bg-black">
        <div className="relative w-full max-w-md h-full flex items-center justify-center">
          <MediaPlayer key={currentPost._id} post={currentPost} isTikTokStyle={true} />
        </div>
        
        {/* Video info overlay - left side next to video */}
        <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-[520px] max-w-xs z-20">
          <VideoInfo key={currentPost._id} post={currentPost} isTikTokStyle={true} />
        </div>
        
        {/* Action buttons overlay - right side directly next to video */}
        <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 translate-x-60 flex flex-col space-y-4">
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={handleLikeClick}
              className={`p-3 rounded-full transition-all duration-200 cursor-pointer transform hover:scale-110 ${
                likesInfo[currentPost._id]?.hasLiked
                  ? 'bg-red-500/90 hover:bg-red-500 shadow-lg shadow-red-500/30'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <IoHeart className={`text-2xl transition-colors duration-200 ${
                likesInfo[currentPost._id]?.hasLiked ? 'text-white' : 'text-white'
              }`} />
            </button>
            <span className="text-white text-xs font-medium">
              {likesInfo[currentPost._id]?.count ?? currentPost.likes_count}
            </span>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
              <AiFillMessage className="text-2xl text-white" />
            </div>
            <span className="text-white text-xs font-medium">{currentPost.comments_count}</span>
          </div>

          {/* 3-dot menu for post options */}
          {isCurrentUserPost && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
              >
                <BsThreeDotsVertical className="text-2xl text-white" />
              </button>
              
              {/* Delete menu dropdown */}
              {showDeleteMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:bg-red-500/20 transition-colors w-full text-left"
                  >
                    <MdDelete className="text-lg" />
                    <span className="text-sm">Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons - positioned on the bottom center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-row space-x-4 z-10">
        {/* Left arrow */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full transition-all ${
            currentIndex === 0 
              ? 'bg-black/20 text-white/50 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-black/70 text-white cursor-pointer'
          }`}
          aria-label="Previous video"
        >
          <IoIosArrowUp className="text-2xl" />
        </button>

        {/* Video counter */}
        <div className="bg-black/50 rounded-full px-3 py-1 text-white text-sm font-medium flex items-center">
          {currentIndex + 1} / {currentPosts.length}
        </div>

        {/* Right arrow */}
        <button
          onClick={goToNext}
          disabled={currentIndex === currentPosts.length - 1}
          className={`p-3 rounded-full transition-all ${
            currentIndex === currentPosts.length - 1 
              ? 'bg-black/20 text-white/50 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-black/70 text-white cursor-pointer'
          }`}
          aria-label="Next video"
        >
          <IoIosArrowDown className="text-2xl" />
        </button>
      </div>

      {/* Login/Profile section - top right corner */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3">
        {isLoggedIn && authedUser ? (
          <div className="flex items-center gap-3 text-white">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authedUser.picture_url} />
              <AvatarFallback className="text-xs">
                {authedUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{authedUser.name}</span>
              <button
                onClick={logout}
                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
              >
                <TbLogout className="text-xs" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white">
            <div className="text-sm mb-2 font-medium">Sign in to save and share products</div>
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={() => toast({ title: "Login failed", variant: "destructive" })}
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
}
