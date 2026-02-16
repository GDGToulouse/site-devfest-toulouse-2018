/* eslint-disable no-unused-vars,no-undef */
const uiActions = {
  toggleDrawer: (value = null) => {
    store.dispatch({
      type: TOGGLE_DRAWER,
      value,
    });
  },
  setViewportSize: (value) => {
    store.dispatch({
      type: SET_VIEWPORT_SIZE,
      value,
    });
  },
  toggleVideoDialog: (value = null) => {
    store.dispatch({
      type: TOGGLE_VIDEO_DIALOG,
      value,
    });
  },
  setHeroSettings: (value) => {
    store.dispatch({
      type: SET_HERO_SETTINGS,
      value,
    });
  },
};

const routingActions = {
  setRoute: (routeFromAction) => {
    const route = routeFromAction || 'home';
    store.dispatch({
      type: SET_ROUTE,
      route,
    });
  },
  setSubRoute: (subRoute) => {
    store.dispatch({
      type: SET_SUB_ROUTE,
      subRoute,
    });
  },
  setLocation: (url) => {
    window.history.pushState({}, '', url);
    Polymer.Base.fire('location-changed', {}, { node: window });
  },
};

const dialogsActions = {
  openDialog: (dialogName, data) => {
    store.dispatch({
      type: OPEN_DIALOG,
      dialog: {
        [dialogName]: {
          isOpened: true,
          data,
        },
      },
    });
  },
  closeDialog: (dialogName) => {
    store.dispatch({
      type: CLOSE_DIALOG,
      dialogName,
    });
  },
  setDialogError: (dialogName) => ({
    type: SET_DIALOG_ERROR,
    payload: { dialogName },
  }),
};

let toastHideTimeOut;
const toastActions = {
  showToast: (toast) => {
    const duration = typeof toast.duration !== 'undefined' ? toast.duration : 5000;
    store.dispatch({
      type: SHOW_TOAST,
      toast: Object.assign({}, toast, {
        duration,
        visible: true,
      }),
    });

    if (duration === 0) return;
    clearTimeout(toastHideTimeOut);
    toastHideTimeOut = setTimeout(() => {
      toastActions.hideToast();
    }, duration);
  },

  hideToast: () => {
    clearTimeout(toastHideTimeOut);
    store.dispatch({
      type: HIDE_TOAST,
    });
  },
};

const ticketsActions = {
  fetchTickets: () => (dispatch) => {
    dispatch({
      type: FETCH_TICKETS,
    });

    return fetch('/data/tickets.json')
      .then((response) => response.json())
      .then((data) => {
        const list = data.map((t) => {
          if (t.startsTimestamp == null) {
            return t;
          }
          t.available = Date.now() > new Date(t.startsTimestamp);
          return t;
        });

        dispatch({
          type: FETCH_TICKETS_SUCCESS,
          payload: { list },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_TICKETS_FAILURE,
          payload: { error },
        });
      });
  },
};

const partnersActions = {
  addPartner: () => () => {},
  fetchPartners: () => (dispatch) => {
    dispatch({
      type: FETCH_PARTNERS,
    });

    fetch('/data/partners.json')
      .then((response) => response.json())
      .then((list) => {
        dispatch({
          type: FETCH_PARTNERS_SUCCESS,
          payload: {
            list,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PARTNERS_FAILURE,
          payload: { error },
        });
      });
  },
};

const videosActions = {
  fetchVideos: () => (dispatch) => {
    dispatch({
      type: FETCH_VIDEOS,
    });

    return fetch('/data/videos.json')
      .then((response) => response.json())
      .then((list) => {
        dispatch({
          type: FETCH_VIDEOS_SUCCESS,
          payload: { list },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_VIDEOS_FAILURE,
          payload: { error },
        });
      });
  },
};

const blogActions = {
  fetchList: () => (dispatch) => {
    dispatch({
      type: FETCH_BLOG_LIST,
    });

    fetch('/data/blog.json')
      .then((response) => response.json())
      .then((obj) => {
        const list = Object.keys(obj).map((key) =>
          Object.assign({}, obj[key], { id: key })
        );

        dispatch({
          type: FETCH_BLOG_LIST_SUCCESS,
          payload: {
            obj,
            list,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_BLOG_LIST_FAILURE,
          payload: { error },
        });
      });
  },
};

const speakersActions = {
  fetchList: () => (dispatch) => {
    dispatch({
      type: FETCH_SPEAKERS,
    });

    return fetch('/data/speakers.json')
      .then((response) => response.json())
      .then((obj) => {
        const list = Object.keys(obj).map((key) =>
          Object.assign({}, obj[key], { id: key })
        );

        dispatch({
          type: FETCH_SPEAKERS_SUCCESS,
          payload: {
            obj,
            list,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_SPEAKERS_FAILURE,
          payload: { error },
        });
      });
  },
};

const previousSpeakersActions = {
  fetchList: () => (dispatch) => {
    dispatch({
      type: FETCH_PREVIOUS_SPEAKERS,
    });

    fetch('/data/previousSpeakers.json')
      .then((response) => response.json())
      .then((obj) => {
        const list = Object.keys(obj).map((key) =>
          Object.assign({}, obj[key], { id: key })
        );

        dispatch({
          type: FETCH_PREVIOUS_SPEAKERS_SUCCESS,
          payload: {
            obj,
            list,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PREVIOUS_SPEAKERS_FAILURE,
          payload: { error },
        });
      });
  },
};

const sessionsActions = {
  fetchList: () => (dispatch) => {
    dispatch({
      type: FETCH_SESSIONS,
    });

    fetch('/data/sessions.json')
      .then((response) => response.json())
      .then((sessionsObj) => {
        const list = [];
        const obj = {};
        const objBySpeaker = {};

        Object.keys(sessionsObj).forEach((key) => {
          const data = sessionsObj[key];
          const session = Object.assign({}, data, { id: key });
          list.push(session);
          obj[key] = session;

          if (Array.isArray(data.speakers)) {
            data.speakers.forEach((speakerId) => {
              if (Array.isArray(objBySpeaker[speakerId])) {
                objBySpeaker[speakerId].push(session);
              } else {
                objBySpeaker[speakerId] = [session];
              }
            });
          }
        });

        dispatch({
          type: FETCH_SESSIONS_SUCCESS,
          payload: {
            obj,
            list,
            objBySpeaker,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_SESSIONS_FAILURE,
          payload: { error },
        });
      });
  },

  fetchUserFeaturedSessions: () => (dispatch) => {
    dispatch({
      type: FETCH_USER_FEATURED_SESSIONS,
      payload: {},
    });
    dispatch({
      type: FETCH_USER_FEATURED_SESSIONS_SUCCESS,
      payload: {
        featuredSessions: {},
      },
    });
  },

  setUserFeaturedSessions: () => () => {},
};

const scheduleActions = {
  fetchSchedule: () => (dispatch, getState) => {
    dispatch({
      type: FETCH_SCHEDULE,
    });

    const state = getState();
    const speakersPromise = Object.keys(state.speakers.obj).length
      ? Promise.resolve(state.speakers.obj)
      : speakersActions.fetchList()(dispatch, getState);

    const schedulePromise = fetch('/data/schedule.json')
      .then((response) => response.json());

    return Promise.all([speakersPromise, schedulePromise])
      .then(([speakers, schedule]) => {
        const scheduleWorker = new Worker('/scripts/schedule-webworker.js');

        scheduleWorker.postMessage({
          speakers,
          sessions: getState().sessions.list.obj,
          schedule,
        });

        scheduleWorker.addEventListener('message', ({ data }) => {
          dispatch({
            type: FETCH_SCHEDULE_SUCCESS,
            data: Object.values(data.schedule.days).sort((a, b) => a.date.localeCompare(b.date)),
          });

          const sessionsObjBySpeaker = {};
          const sessionsList = Object.values(data.sessions);

          sessionsList.forEach((session) => {
            if (Array.isArray(session.speakers)) {
              session.speakers.forEach((speaker) => {
                if (Array.isArray(sessionsObjBySpeaker[speaker.id])) {
                  sessionsObjBySpeaker[speaker.id].push(session);
                } else {
                  sessionsObjBySpeaker[speaker.id] = [session];
                }
              });
            }
          });
          store.dispatch({
            type: UPDATE_SESSIONS,
            payload: {
              obj: data.sessions,
              list: sessionsList,
              objBySpeaker: sessionsObjBySpeaker,
            },
          });

          scheduleWorker.terminate();
        }, false);
      })
      .catch((error) => {
        dispatch({
          type: FETCH_SCHEDULE_FAILURE,
          payload: { error },
        });
      });
  },
};

const galleryActions = {
  fetchGallery: () => (dispatch) => {
    dispatch({
      type: FETCH_GALLERY,
    });

    return fetch('/data/gallery.json')
      .then((response) => response.json())
      .then((list) => {
        dispatch({
          type: FETCH_GALLERY_SUCCESS,
          payload: { list },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_GALLERY_FAILURE,
          payload: { error },
        });
      });
  },
};

const teamActions = {
  fetchTeam: () => (dispatch) => {
    dispatch({
      type: FETCH_TEAM,
    });

    fetch('/data/team.json')
      .then((response) => response.json())
      .then((list) => {
        dispatch({
          type: FETCH_TEAM_SUCCESS,
          payload: {
            list,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: FETCH_TEAM_FAILURE,
          payload: { error },
        });
      });
  },
};

const userActions = {
  signIn: () => {},
  mergeAccounts: () => {},
  updateUser: () => {},
  signOut: () => {},
};

const subscribeActions = {
  subscribe: () => () => {},
  resetSubscribed: () => {
    store.dispatch({
      type: SUBSCRIBE,
      subscribed: false,
    });
  },
};

const notificationsActions = {
  initializeMessaging: () => Promise.resolve(),
  requestPermission: () => () => {},
  getToken: () => () => {},
  unsubscribe: () => () => {},
};

const helperActions = {
  storeUser: (user) => {
    let userToStore = { signedIn: false };

    if (user) {
      const {
        uid,
        displayName,
        photoURL,
        refreshToken,
        actualProvider,
        pendingCredential,
      } = user;

      const email = user.email || (user.providerData && user.providerData[0].email);
      const initialProviderId =
        (user.providerData && user.providerData[0].providerId) || user.initialProviderId;
      const signedIn = (user.uid && true) || user.signedIn;

      userToStore = {
        signedIn,
        uid,
        email,
        displayName,
        photoURL,
        refreshToken,
        initialProviderId,
        actualProvider,
        pendingCredential,
      };
    }

    store.dispatch({
      type: SIGN_IN,
      user: userToStore,
    });
  },

  trackError: (action, method, message) => {
    if (window.ga) {
      ga('send', 'event', 'error', action + ':' + method, message);
    }
  },
};
