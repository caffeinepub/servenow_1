import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types & Enums
  type ServiceCategory = { #chef; #plumber; #carpenter; #pestControl };

  module ServiceCategory {
    public func compare(a : ServiceCategory, b : ServiceCategory) : Order.Order {
      switch (a, b) {
        case (#chef, #chef) { #equal };
        case (#plumber, #plumber) { #equal };
        case (#carpenter, #carpenter) { #equal };
        case (#pestControl, #pestControl) { #equal };
        case (#chef, #plumber) { #less };
        case (#chef, #carpenter) { #less };
        case (#chef, #pestControl) { #less };
        case (#plumber, #chef) { #greater };
        case (#plumber, #carpenter) { #less };
        case (#plumber, #pestControl) { #less };
        case (#carpenter, #chef) { #greater };
        case (#carpenter, #plumber) { #greater };
        case (#carpenter, #pestControl) { #less };
        case (#pestControl, _) { #greater };
      };
    };
  };

  type ChefSubService = { #dailyCook; #partyCook; #mealPrep };
  type PlumberSubService = { #pipeRepair; #leakFix; #installation };
  type CarpenterSubService = { #furnitureRepair; #customFurniture; #doorWindow };
  type PestControlSubService = { #residential; #commercial; #termite };

  // Unified Service type
  type Service = {
    category : ServiceCategory;
    subService : Text;
    basePriceEstimate : Nat;
  };

  module Service {
    public func compare(a : Service, b : Service) : Order.Order {
      switch (ServiceCategory.compare(a.category, b.category)) {
        case (#equal) { a.subService.compare(b.subService) };
        case (order) { order };
      };
    };
  };

  // Professional enums
  type ProfessionalStatus = { #pending; #approved; #suspended };
  type AvailabilityStatus = { #online; #offline };

  // Booking enums
  type BookingStatus = {
    #pending;
    #accepted;
    #onTheWay;
    #inProgress;
    #completed;
    #cancelled;
  };

  // User Profiles
  public type UserProfile = {
    role : { #customer; #professional };
    name : Text;
    phone : Text;
  };

  public type CustomerProfile = {
    name : Text;
    phone : Text;
    addresses : [Text];
  };

  public type ProfessionalProfile = {
    name : Text;
    phone : Text;
    category : ServiceCategory;
    subSkills : [Text];
    availability : AvailabilityStatus;
    status : ProfessionalStatus;
    bio : Text;
    workingRadius : Nat; // radius in kilometers
    aggregateRating : ?Float;
  };

  // Booking
  public type Booking = {
    id : Nat;
    customer : Principal;
    professional : Principal;
    category : ServiceCategory;
    subService : Text;
    date : Time.Time;
    timeSlot : Text;
    address : Text;
    notes : Text;
    status : BookingStatus;
    amount : Nat;
    cancellationFee : Bool;
  };

  module Booking {
    public func compareByCustomer(booking1 : Booking, booking2 : Booking) : Order.Order {
      Text.compare(booking1.customer.toText(), booking2.customer.toText());
    };

    public func compareByProfessional(booking1 : Booking, booking2 : Booking) : Order.Order {
      Text.compare(booking1.professional.toText(), booking2.professional.toText());
    };

    public func compareByStatus(booking1 : Booking, booking2 : Booking) : Order.Order {
      Text.compare(debug_show booking1.status, debug_show booking2.status);
    };
  };

  // Review
  public type Review = {
    bookingId : Nat;
    customer : Principal;
    professional : Principal;
    rating : Nat8;
    comment : Text;
    timestamp : Time.Time;
  };

  module Review {
    public func compare(review1 : Review, review2 : Review) : Order.Order {
      Nat8.compare(review1.rating, review2.rating);
    };
  };

  public type ProfessionalEarnings = {
    totalEarnings : Nat;
    dailyEarnings : Nat;
    weeklyEarnings : Nat;
    monthlyEarnings : Nat;
  };

  type UserRole = { #customer; #professional };

  // Stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let customerProfiles = Map.empty<Principal, CustomerProfile>();
  let professionalProfiles = Map.empty<Principal, ProfessionalProfile>();
  let bookings = Map.empty<Nat, Booking>();
  let reviews = Map.empty<Nat, Review>();

  // Prefabricated service catalog
  let serviceCatalog : [Service] = [
    // Chef Services
    {
      category = #chef;
      subService = "DailyCook";
      basePriceEstimate = 5000;
    },
    {
      category = #chef;
      subService = "PartyCook";
      basePriceEstimate = 10000;
    },
    {
      category = #chef;
      subService = "MealPrep";
      basePriceEstimate = 7000;
    },
    // Plumber Services
    {
      category = #plumber;
      subService = "PipeRepair";
      basePriceEstimate = 8000;
    },
    {
      category = #plumber;
      subService = "LeakFix";
      basePriceEstimate = 7500;
    },
    {
      category = #plumber;
      subService = "Installation";
      basePriceEstimate = 9000;
    },
    // Carpenter Services
    {
      category = #carpenter;
      subService = "FurnitureRepair";
      basePriceEstimate = 12000;
    },
    {
      category = #carpenter;
      subService = "CustomFurniture";
      basePriceEstimate = 30000;
    },
    {
      category = #carpenter;
      subService = "DoorWindow";
      basePriceEstimate = 10000;
    },
    // Pest Control Services
    {
      category = #pestControl;
      subService = "Residential";
      basePriceEstimate = 15000;
    },
    {
      category = #pestControl;
      subService = "Commercial";
      basePriceEstimate = 25000;
    },
    {
      category = #pestControl;
      subService = "Termite";
      basePriceEstimate = 20000;
    },
  ].sort();

  // Prefabricated backend components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Track booking IDs
  var nextBookingId = 0;

  // Required User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Profile Registration/Management
  public shared ({ caller }) func registerCustomer(name : Text, phone : Text, addresses : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    let profile : CustomerProfile = {
      name;
      phone;
      addresses;
    };
    customerProfiles.add(caller, profile);

    let userProfile : UserProfile = {
      role = #customer;
      name;
      phone;
    };
    userProfiles.add(caller, userProfile);
  };

  public shared ({ caller }) func registerProfessional(name : Text, phone : Text, category : ServiceCategory, subSkills : [Text], bio : Text, workingRadius : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    let profile : ProfessionalProfile = {
      name;
      phone;
      category;
      subSkills;
      availability = #offline;
      status = #pending;
      bio;
      workingRadius;
      aggregateRating = null;
    };
    professionalProfiles.add(caller, profile);

    let userProfile : UserProfile = {
      role = #professional;
      name;
      phone;
    };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getCustomerProfile(user : Principal) : async ?CustomerProfile {
    // Anyone can view customer profiles (for professionals to see customer info)
    customerProfiles.get(user);
  };

  public query ({ caller }) func getProfessionalProfile(user : Principal) : async ?ProfessionalProfile {
    // Anyone can view professional profiles (public directory)
    professionalProfiles.get(user);
  };

  public shared ({ caller }) func updateCustomerProfile(addresses : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (customerProfiles.get(caller)) {
      case (null) { Runtime.trap("Customer profile does not exist") };
      case (?profile) {
        customerProfiles.add(caller, { profile with addresses });
      };
    };
  };

  public shared ({ caller }) func updateProfessionalAvailability(availability : AvailabilityStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update availability");
    };

    switch (professionalProfiles.get(caller)) {
      case (null) { Runtime.trap("Professional profile does not exist") };
      case (?profile) {
        professionalProfiles.add(caller, { profile with availability });
      };
    };
  };

  // Admin-only: Approve or suspend professionals
  public shared ({ caller }) func updateProfessionalStatus(professional : Principal, status : ProfessionalStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update professional status");
    };

    switch (professionalProfiles.get(professional)) {
      case (null) { Runtime.trap("Professional profile does not exist") };
      case (?profile) {
        professionalProfiles.add(professional, { profile with status });
      };
    };
  };

  // Service Catalog (public)
  public query ({ caller }) func getServiceCatalog() : async [Service] {
    serviceCatalog;
  };

  // Booking Management
  public shared ({ caller }) func createBooking(professional : Principal, category : ServiceCategory, subService : Text, date : Time.Time, timeSlot : Text, address : Text, notes : Text, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    if (not customerProfiles.containsKey(caller)) {
      Runtime.trap("Only customers can create bookings");
    };

    if (not professionalProfiles.containsKey(professional)) {
      Runtime.trap("Professional does not exist");
    };

    let booking : Booking = {
      id = nextBookingId;
      customer = caller;
      professional;
      category;
      subService;
      date;
      timeSlot;
      address;
      notes;
      status = #pending;
      amount;
      cancellationFee = false;
    };

    bookings.add(nextBookingId, booking);
    nextBookingId += 1;
    booking.id;
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking status");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Only the professional assigned to the booking can update its status
        if (caller != booking.professional) {
          Runtime.trap("Unauthorized: Only the assigned professional can update booking status");
        };

        // Validate status transitions
        switch (booking.status, status) {
          case (#pending, #accepted) { () };
          case (#accepted, #onTheWay) { () };
          case (#onTheWay, #inProgress) { () };
          case (#inProgress, #completed) { () };
          case _ { Runtime.trap("Invalid status transition") };
        };

        var updatedBooking = { booking with status };
        if (status == #accepted) {
          updatedBooking := { updatedBooking with cancellationFee = true };
        };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Only the customer who created the booking can cancel it
        if (caller != booking.customer) {
          Runtime.trap("Unauthorized: Only the customer can cancel their booking");
        };

        if (booking.status == #pending or booking.status == #accepted) {
          bookings.add(bookingId, { booking with status = #cancelled });
        } else {
          Runtime.trap("Cannot cancel booking in current status");
        };
      };
    };
  };

  // Review & Rating
  public shared ({ caller }) func submitReview(bookingId : Nat, rating : Nat8, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Only the customer who created the booking can review it
        if (caller != booking.customer) {
          Runtime.trap("Unauthorized: Only the customer can review their booking");
        };

        // Can only review completed bookings
        if (booking.status != #completed) {
          Runtime.trap("Can only review completed bookings");
        };

        // Check if review already exists
        if (reviews.containsKey(bookingId)) {
          Runtime.trap("Review already submitted for this booking");
        };

        let review : Review = {
          bookingId;
          customer = caller;
          professional = booking.professional;
          rating;
          comment;
          timestamp = Time.now();
        };
        reviews.add(bookingId, review);
        updateProfessionalRating(booking.professional);
      };
    };
  };

  func updateProfessionalRating(professional : Principal) {
    let professionalReviews = reviews.values().toArray();
    var sum : Float = 0.0;
    var count : Nat = 0;

    for (review in professionalReviews.values()) {
      if (review.professional == professional) {
        sum += Nat8.toNat(review.rating).toFloat();
        count += 1;
      };
    };

    if (count > 0) {
      let average = sum / count.toFloat();
      switch (professionalProfiles.get(professional)) {
        case (?profile) {
          professionalProfiles.add(professional, { profile with aggregateRating = ?average });
        };
        case (null) { () };
      };
    };
  };

  // Earnings
  public query ({ caller }) func getProfessionalEarnings(professional : Principal) : async ProfessionalEarnings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earnings");
    };

    // Only the professional themselves or admins can view earnings
    if (caller != professional and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own earnings");
    };

    let allBookings = bookings.values().toArray();
    let professionalBookings = allBookings.filter(func(b : Booking) : Bool { b.professional == professional and b.status == #completed });

    // Calculate earnings
    var total = 0;
    var daily = 0;
    var weekly = 0;
    var monthly = 0;

    let now = Time.now();

    for (booking in professionalBookings.values()) {
      total += booking.amount;
      if (booking.date > now - 86_400_000_000_000) { // 1 day in nanoseconds
        daily += booking.amount;
      };
      if (booking.date > now - 7 * 86_400_000_000_000) { // 7 days in nanoseconds
        weekly += booking.amount;
      };
      if (booking.date > now - 30 * 86_400_000_000_000) { // 30 days in nanoseconds
        monthly += booking.amount;
      };
    };

    {
      totalEarnings = total;
      dailyEarnings = daily;
      weeklyEarnings = weekly;
      monthlyEarnings = monthly;
    };
  };

  // Query APIs
  public query ({ caller }) func getAvailableProfessionalsByCategory(category : ServiceCategory) : async [ProfessionalProfile] {
    // Public query - anyone can search for professionals
    let professionalArray = professionalProfiles.values().toArray();

    let filteredProfessionals = professionalArray.filter(
      func(p : ProfessionalProfile) : Bool { p.category == category and p.status == #approved and p.availability == #online }
    );

    filteredProfessionals;
  };

  public query ({ caller }) func getBookingsByCustomer(customer : Principal, status : BookingStatus) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    // Only the customer themselves or admins can view their bookings
    if (caller != customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    bookings.values().toArray().filter(func(b : Booking) : Bool { b.customer == customer and b.status == status });
  };

  public query ({ caller }) func getBookingsByProfessional(professional : Principal, status : BookingStatus) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    // Only the professional themselves or admins can view their bookings
    if (caller != professional and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    bookings.values().toArray().filter(func(b : Booking) : Bool { b.professional == professional and b.status == status });
  };

  public query ({ caller }) func getReviewsByProfessional(professional : Principal) : async [Review] {
    // Public query - anyone can view professional reviews
    reviews.values().toArray().filter(func(r : Review) : Bool { r.professional == professional });
  };

  // Admin query: Get all professionals (for approval management)
  public query ({ caller }) func getAllProfessionals() : async [ProfessionalProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all professionals");
    };
    professionalProfiles.values().toArray();
  };
};
